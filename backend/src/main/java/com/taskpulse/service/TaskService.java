package com.taskpulse.service;

import com.taskpulse.dto.CreateTaskRequest;
import com.taskpulse.dto.TaskResponse;
import com.taskpulse.dto.UpdateTaskStatusRequest;
import com.taskpulse.model.*;
import com.taskpulse.repository.TaskAuditLogRepository;
import com.taskpulse.repository.TaskRepository;
import com.taskpulse.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class TaskService {

    @Autowired
    private TaskRepository taskRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private TaskAuditLogRepository auditLogRepository;

    @Autowired
    private EmailNotificationService emailNotificationService;

    @Autowired
    private NotificationService notificationService;

    /**
     * Get all tasks, optionally filtered by status, assignee, mentor, or manager
     */
    public List<TaskResponse> getTasks(TaskStatus status, Long assigneeId, Long mentorId, Long managerId) {
        List<Task> tasks;
        if (status != null) {
            tasks = taskRepository.findByStatus(status);
        } else if (assigneeId != null) {
            tasks = taskRepository.findByAssigneeId(assigneeId);
        } else if (mentorId != null) {
            tasks = taskRepository.findByMentorId(mentorId);
        } else if (managerId != null) {
            tasks = taskRepository.findByManagerId(managerId);
        } else {
            tasks = taskRepository.findAll();
        }

        return tasks.stream()
                .map(TaskResponse::fromEntity)
                .collect(Collectors.toList());
    }

    public TaskResponse getTaskById(Long id) {
        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Task not found with ID: " + id));
        return TaskResponse.fromEntity(task);
    }

    /**
     * Create a new task (Manager role action)
     * Triggers email to Mentor with Due Date
     */
    @Transactional
    public TaskResponse createTask(CreateTaskRequest request) {
        User manager = userRepository.findById(request.getManagerId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid manager ID"));
        User assignee = userRepository.findById(request.getAssigneeId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid assignee ID"));
        User mentor = userRepository.findById(request.getMentorId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid mentor ID"));

        Task task = new Task(
                request.getTitle(),
                request.getDescription(),
                request.getPriority(),
                request.getDueDate(),
                manager,
                assignee,
                mentor
        );

        Task savedTask = taskRepository.save(task);

        // 1. Create audit log
        TaskAuditLog audit = new TaskAuditLog(savedTask, manager, null, TaskStatus.PENDING, "Task created and assigned");
        auditLogRepository.save(audit);

        // 2. Dispatch in-app notifications
        notificationService.createNotification(
                mentor,
                savedTask.getId(),
                "TASK_ASSIGNED",
                "New Mentorship Task Assigned",
                String.format("You are mentoring '%s' assigned to %s. Due on %s.", 
                        savedTask.getTitle(), assignee.getFullName(), savedTask.getDueDate())
        );

        notificationService.createNotification(
                assignee,
                savedTask.getId(),
                "TASK_ASSIGNED",
                "New Task Assigned to You",
                String.format("You have been assigned '%s'. Mentor: %s. Due: %s.", 
                        savedTask.getTitle(), mentor.getFullName(), savedTask.getDueDate())
        );

        // 3. Trigger Email to Mentor with Due Date (Asynchronous)
        emailNotificationService.sendTaskAssignedEmail(savedTask);

        return TaskResponse.fromEntity(savedTask);
    }

    /**
     * Update task status (Authorized for assigned Mentor or Manager)
     * When completed, triggers email to Manager
     */
    @Transactional
    public TaskResponse updateTaskStatus(Long taskId, UpdateTaskStatusRequest request) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Task not found with ID: " + taskId));

        User actor = userRepository.findById(request.getActorId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid actor ID"));

        // Security check: Only the designated mentor or manager can transition status
        boolean isAssignedMentor = task.getMentor().getId().equals(actor.getId());
        boolean isManager = task.getManager().getId().equals(actor.getId()) || actor.getRole() == Role.MANAGER;

        if (!isAssignedMentor && !isManager) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, 
                    "Permission denied: Only the assigned Mentor (" + task.getMentor().getFullName() 
                    + ") or Manager can update the status of this task.");
        }

        TaskStatus previousStatus = task.getStatus();
        TaskStatus newStatus = request.getStatus();

        task.setStatus(newStatus);
        if (request.getNotes() != null && !request.getNotes().isBlank()) {
            task.setMentorNotes(request.getNotes());
        }

        // Completion lifecycle handling
        if (newStatus == TaskStatus.COMPLETED) {
            task.setCompletedAt(LocalDateTime.now());
        } else if (previousStatus == TaskStatus.COMPLETED && newStatus != TaskStatus.COMPLETED) {
            task.setCompletedAt(null); // Reopened
        }

        Task updatedTask = taskRepository.save(task);

        // 1. Create audit log entry
        TaskAuditLog audit = new TaskAuditLog(
                updatedTask, 
                actor, 
                previousStatus, 
                newStatus, 
                request.getNotes() != null ? request.getNotes() : "Status updated to " + newStatus
        );
        auditLogRepository.save(audit);

        // 2. Notification dispatch based on transition
        if (newStatus == TaskStatus.COMPLETED) {
            // Notify Manager via In-App Notification
            notificationService.createNotification(
                    task.getManager(),
                    task.getId(),
                    "TASK_COMPLETED",
                    "Task Completed: " + task.getTitle(),
                    String.format("Mentor %s marked task '%s' (Assignee: %s) as COMPLETED.", 
                            actor.getFullName(), task.getTitle(), task.getAssignee().getFullName())
            );

            // Notify Assignee (Mentee)
            notificationService.createNotification(
                    task.getAssignee(),
                    task.getId(),
                    "TASK_COMPLETED",
                    "Task Approved & Completed",
                    String.format("Your task '%s' was verified and marked COMPLETED by Mentor %s.", 
                            task.getTitle(), actor.getFullName())
            );

            // Trigger Email to Manager (You)
            emailNotificationService.sendTaskCompletedEmail(updatedTask);
        } else {
            // In progress or reopened notification to Assignee
            notificationService.createNotification(
                    task.getAssignee(),
                    task.getId(),
                    "STATUS_CHANGED",
                    "Task Status Updated: " + newStatus,
                    String.format("Mentor %s updated '%s' status to %s.", 
                            actor.getFullName(), task.getTitle(), newStatus)
            );
        }

        return TaskResponse.fromEntity(updatedTask);
    }
}


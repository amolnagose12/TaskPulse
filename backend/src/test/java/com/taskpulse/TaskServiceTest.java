package com.taskpulse;

import com.taskpulse.dto.CreateTaskRequest;
import com.taskpulse.dto.TaskResponse;
import com.taskpulse.dto.UpdateTaskStatusRequest;
import com.taskpulse.model.Role;
import com.taskpulse.model.TaskPriority;
import com.taskpulse.model.TaskStatus;
import com.taskpulse.model.User;
import com.taskpulse.repository.UserRepository;
import com.taskpulse.service.TaskService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
public class TaskServiceTest {

    @Autowired
    private TaskService taskService;

    @Autowired
    private UserRepository userRepository;

    private User manager;
    private User mentor;
    private User mentee;

    @BeforeEach
    void setup() {
        manager = userRepository.findAll().stream()
                .filter(u -> u.getRole() == Role.MANAGER)
                .findFirst().orElseThrow();

        mentor = userRepository.findAll().stream()
                .filter(u -> u.getRole() == Role.MENTOR)
                .findFirst().orElseThrow();

        mentee = userRepository.findAll().stream()
                .filter(u -> u.getRole() == Role.MEMBER)
                .findFirst().orElseThrow();
    }

    @Test
    void testCreateTask_SuccessfulCreation() {
        CreateTaskRequest request = new CreateTaskRequest();
        request.setTitle("Build CI/CD Pipeline");
        request.setDescription("Automate GitHub Actions build and test suite");
        request.setPriority(TaskPriority.HIGH);
        request.setDueDate(LocalDate.now().plusDays(4));
        request.setManagerId(manager.getId());
        request.setAssigneeId(mentee.getId());
        request.setMentorId(mentor.getId());

        TaskResponse created = taskService.createTask(request);

        assertNotNull(created.getId());
        assertEquals("Build CI/CD Pipeline", created.getTitle());
        assertEquals(TaskStatus.PENDING, created.getStatus());
        assertEquals(mentor.getId(), created.getMentor().getId());
        assertEquals(mentee.getId(), created.getAssignee().getId());
        assertFalse(created.isOverdue());
    }

    @Test
    void testMentorCanUpdateStatusToInProgressAndCompleted() {
        // 1. Create a task
        CreateTaskRequest request = new CreateTaskRequest();
        request.setTitle("Security Audit & Pentest");
        request.setDescription("Verify OWASP Top 10 compliance");
        request.setPriority(TaskPriority.URGENT);
        request.setDueDate(LocalDate.now().plusDays(2));
        request.setManagerId(manager.getId());
        request.setAssigneeId(mentee.getId());
        request.setMentorId(mentor.getId());

        TaskResponse task = taskService.createTask(request);

        // 2. Mentor updates to IN_PROGRESS
        UpdateTaskStatusRequest updateReq = new UpdateTaskStatusRequest();
        updateReq.setActorId(mentor.getId());
        updateReq.setStatus(TaskStatus.IN_PROGRESS);
        updateReq.setNotes("Audit started, reviewing static analysis findings.");

        TaskResponse inProgressTask = taskService.updateTaskStatus(task.getId(), updateReq);
        assertEquals(TaskStatus.IN_PROGRESS, inProgressTask.getStatus());
        assertEquals("Audit started, reviewing static analysis findings.", inProgressTask.getMentorNotes());

        // 3. Mentor updates to COMPLETED
        updateReq.setStatus(TaskStatus.COMPLETED);
        updateReq.setNotes("All vulnerabilities remediated and approved.");

        TaskResponse completedTask = taskService.updateTaskStatus(task.getId(), updateReq);
        assertEquals(TaskStatus.COMPLETED, completedTask.getStatus());
        assertNotNull(completedTask.getCompletedAt());
    }

    @Test
    void testUnauthorizedUserCannotUpdateStatus() {
        // Create task
        CreateTaskRequest request = new CreateTaskRequest();
        request.setTitle("Refactor Service Layer");
        request.setDueDate(LocalDate.now().plusDays(5));
        request.setManagerId(manager.getId());
        request.setAssigneeId(mentee.getId());
        request.setMentorId(mentor.getId());

        TaskResponse task = taskService.createTask(request);

        // Mentee (member) attempts to mark task as completed directly without mentor sign-off
        UpdateTaskStatusRequest updateReq = new UpdateTaskStatusRequest();
        updateReq.setActorId(mentee.getId()); // Mentee attempting update
        updateReq.setStatus(TaskStatus.COMPLETED);
        updateReq.setNotes("I finished it myself!");

        assertThrows(ResponseStatusException.class, () -> {
            taskService.updateTaskStatus(task.getId(), updateReq);
        }, "Mentee should not be authorized to change status directly without mentor sign-off");
    }
}


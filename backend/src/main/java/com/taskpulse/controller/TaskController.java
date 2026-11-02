package com.taskpulse.controller;

import com.taskpulse.dto.CreateTaskRequest;
import com.taskpulse.dto.TaskResponse;
import com.taskpulse.dto.UpdateTaskStatusRequest;
import com.taskpulse.model.TaskAuditLog;
import com.taskpulse.model.TaskStatus;
import com.taskpulse.repository.TaskAuditLogRepository;
import com.taskpulse.service.TaskReminderScheduler;
import com.taskpulse.service.TaskService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/tasks")
public class TaskController {

    @Autowired
    private TaskService taskService;

    @Autowired
    private TaskAuditLogRepository auditLogRepository;

    @Autowired
    private TaskReminderScheduler reminderScheduler;

    @GetMapping
    public ResponseEntity<List<TaskResponse>> getTasks(
            @RequestParam(required = false) TaskStatus status,
            @RequestParam(required = false) Long assigneeId,
            @RequestParam(required = false) Long mentorId,
            @RequestParam(required = false) Long managerId) {
        return ResponseEntity.ok(taskService.getTasks(status, assigneeId, mentorId, managerId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<TaskResponse> getTaskById(@PathVariable Long id) {
        return ResponseEntity.ok(taskService.getTaskById(id));
    }

    @PostMapping
    public ResponseEntity<TaskResponse> createTask(@Valid @RequestBody CreateTaskRequest request) {
        TaskResponse response = taskService.createTask(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<TaskResponse> updateTaskStatus(
            @PathVariable Long id,
            @Valid @RequestBody UpdateTaskStatusRequest request) {
        TaskResponse response = taskService.updateTaskStatus(id, request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}/audit-logs")
    public ResponseEntity<List<TaskAuditLog>> getTaskAuditLogs(@PathVariable Long id) {
        return ResponseEntity.ok(auditLogRepository.findByTaskIdOrderByCreatedAtDesc(id));
    }

    @PostMapping("/trigger-deadline-reminders")
    public ResponseEntity<Map<String, Object>> triggerDeadlineReminders() {
        int count = reminderScheduler.checkAndDispatchDeadlineReminders();
        return ResponseEntity.ok(Map.of(
                "message", "Deadline reminder evaluation completed successfully.",
                "remindersSent", count
        ));
    }
}


package com.taskpulse.dto;

import com.taskpulse.model.Task;
import com.taskpulse.model.TaskPriority;
import com.taskpulse.model.TaskStatus;

import java.time.LocalDate;
import java.time.LocalDateTime;

public class TaskResponse {
    private Long id;
    private String title;
    private String description;
    private TaskStatus status;
    private TaskPriority priority;
    private LocalDate dueDate;
    private UserResponse manager;
    private UserResponse assignee;
    private UserResponse mentor;
    private String mentorNotes;
    private LocalDateTime completedAt;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private boolean isOverdue;

    public TaskResponse() {
    }

    public static TaskResponse fromEntity(Task task) {
        if (task == null) return null;
        TaskResponse dto = new TaskResponse();
        dto.setId(task.getId());
        dto.setTitle(task.getTitle());
        dto.setDescription(task.getDescription());
        dto.setStatus(task.getStatus());
        dto.setPriority(task.getPriority());
        dto.setDueDate(task.getDueDate());
        dto.setManager(UserResponse.fromEntity(task.getManager()));
        dto.setAssignee(UserResponse.fromEntity(task.getAssignee()));
        dto.setMentor(UserResponse.fromEntity(task.getMentor()));
        dto.setMentorNotes(task.getMentorNotes());
        dto.setCompletedAt(task.getCompletedAt());
        dto.setCreatedAt(task.getCreatedAt());
        dto.setUpdatedAt(task.getUpdatedAt());
        
        boolean overdue = task.getStatus() != TaskStatus.COMPLETED 
                && task.getDueDate() != null 
                && task.getDueDate().isBefore(LocalDate.now());
        dto.setOverdue(overdue);

        return dto;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public TaskStatus getStatus() {
        return status;
    }

    public void setStatus(TaskStatus status) {
        this.status = status;
    }

    public TaskPriority getPriority() {
        return priority;
    }

    public void setPriority(TaskPriority priority) {
        this.priority = priority;
    }

    public LocalDate getDueDate() {
        return dueDate;
    }

    public void setDueDate(LocalDate dueDate) {
        this.dueDate = dueDate;
    }

    public UserResponse getManager() {
        return manager;
    }

    public void setManager(UserResponse manager) {
        this.manager = manager;
    }

    public UserResponse getAssignee() {
        return assignee;
    }

    public void setAssignee(UserResponse assignee) {
        this.assignee = assignee;
    }

    public UserResponse getMentor() {
        return mentor;
    }

    public void setMentor(UserResponse mentor) {
        this.mentor = mentor;
    }

    public String getMentorNotes() {
        return mentorNotes;
    }

    public void setMentorNotes(String mentorNotes) {
        this.mentorNotes = mentorNotes;
    }

    public LocalDateTime getCompletedAt() {
        return completedAt;
    }

    public void setCompletedAt(LocalDateTime completedAt) {
        this.completedAt = completedAt;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    public boolean isOverdue() {
        return isOverdue;
    }

    public void setOverdue(boolean overdue) {
        isOverdue = overdue;
    }
}


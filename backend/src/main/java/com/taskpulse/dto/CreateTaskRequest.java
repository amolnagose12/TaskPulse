package com.taskpulse.dto;

import com.taskpulse.model.TaskPriority;
import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;

public class CreateTaskRequest {

    @NotBlank(message = "Task title cannot be blank")
    private String title;

    private String description;

    @NotNull(message = "Priority is required")
    private TaskPriority priority = TaskPriority.MEDIUM;

    @NotNull(message = "Due date is required")
    private LocalDate dueDate;

    @NotNull(message = "Assignee ID is required")
    private Long assigneeId;

    @NotNull(message = "Mentor ID is required")
    private Long mentorId;

    @NotNull(message = "Manager ID is required")
    private Long managerId;

    public CreateTaskRequest() {
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

    public Long getAssigneeId() {
        return assigneeId;
    }

    public void setAssigneeId(Long assigneeId) {
        this.assigneeId = assigneeId;
    }

    public Long getMentorId() {
        return mentorId;
    }

    public void setMentorId(Long mentorId) {
        this.mentorId = mentorId;
    }

    public Long getManagerId() {
        return managerId;
    }

    public void setManagerId(Long managerId) {
        this.managerId = managerId;
    }
}


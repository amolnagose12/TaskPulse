package com.taskpulse.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "sent_email_records")
public class SentEmailRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "recipient_email", nullable = false)
    private String recipientEmail;

    @Column(name = "recipient_name")
    private String recipientName;

    @Column(nullable = false)
    private String subject;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String htmlContent;

    @Column(name = "trigger_event", nullable = false)
    private String triggerEvent; // e.g. "TASK_ASSIGNED_TO_MENTOR", "TASK_COMPLETED_TO_MANAGER", "DEADLINE_REMINDER"

    @Column(name = "task_id")
    private Long taskId;

    @Column(name = "delivery_status", nullable = false)
    private String deliveryStatus; // "SIMULATED_SUCCESS", "SENT_VIA_SMTP", "FAILED"

    @Column(name = "sent_at", nullable = false, updatable = false)
    private LocalDateTime sentAt;

    public SentEmailRecord() {
    }

    public SentEmailRecord(String recipientEmail, String recipientName, String subject,
                           String htmlContent, String triggerEvent, Long taskId, String deliveryStatus) {
        this.recipientEmail = recipientEmail;
        this.recipientName = recipientName;
        this.subject = subject;
        this.htmlContent = htmlContent;
        this.triggerEvent = triggerEvent;
        this.taskId = taskId;
        this.deliveryStatus = deliveryStatus;
        this.sentAt = LocalDateTime.now();
    }

    @PrePersist
    protected void onCreate() {
        if (this.sentAt == null) {
            this.sentAt = LocalDateTime.now();
        }
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getRecipientEmail() {
        return recipientEmail;
    }

    public void setRecipientEmail(String recipientEmail) {
        this.recipientEmail = recipientEmail;
    }

    public String getRecipientName() {
        return recipientName;
    }

    public void setRecipientName(String recipientName) {
        this.recipientName = recipientName;
    }

    public String getSubject() {
        return subject;
    }

    public void setSubject(String subject) {
        this.subject = subject;
    }

    public String getHtmlContent() {
        return htmlContent;
    }

    public void setHtmlContent(String htmlContent) {
        this.htmlContent = htmlContent;
    }

    public String getTriggerEvent() {
        return triggerEvent;
    }

    public void setTriggerEvent(String triggerEvent) {
        this.triggerEvent = triggerEvent;
    }

    public Long getTaskId() {
        return taskId;
    }

    public void setTaskId(Long taskId) {
        this.taskId = taskId;
    }

    public String getDeliveryStatus() {
        return deliveryStatus;
    }

    public void setDeliveryStatus(String deliveryStatus) {
        this.deliveryStatus = deliveryStatus;
    }

    public LocalDateTime getSentAt() {
        return sentAt;
    }

    public void setSentAt(LocalDateTime sentAt) {
        this.sentAt = sentAt;
    }
}


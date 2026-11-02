package com.taskpulse.dto;

import com.taskpulse.model.SentEmailRecord;
import java.time.LocalDateTime;

public class SentEmailResponse {
    private Long id;
    private String recipientEmail;
    private String recipientName;
    private String subject;
    private String htmlContent;
    private String triggerEvent;
    private Long taskId;
    private String deliveryStatus;
    private LocalDateTime sentAt;

    public SentEmailResponse() {
    }

    public static SentEmailResponse fromEntity(SentEmailRecord entity) {
        if (entity == null) return null;
        SentEmailResponse dto = new SentEmailResponse();
        dto.setId(entity.getId());
        dto.setRecipientEmail(entity.getRecipientEmail());
        dto.setRecipientName(entity.getRecipientName());
        dto.setSubject(entity.getSubject());
        dto.setHtmlContent(entity.getHtmlContent());
        dto.setTriggerEvent(entity.getTriggerEvent());
        dto.setTaskId(entity.getTaskId());
        dto.setDeliveryStatus(entity.getDeliveryStatus());
        dto.setSentAt(entity.getSentAt());
        return dto;
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


package com.taskpulse.service;

import com.taskpulse.model.SentEmailRecord;
import com.taskpulse.model.Task;
import com.taskpulse.model.User;
import com.taskpulse.repository.SentEmailRecordRepository;
import jakarta.mail.internet.MimeMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.time.format.DateTimeFormatter;

@Service
public class EmailNotificationService {

    private static final Logger logger = LoggerFactory.getLogger(EmailNotificationService.class);

    @Autowired(required = false)
    private JavaMailSender mailSender;

    @Autowired
    private SentEmailRecordRepository emailRecordRepository;

    @Value("${taskpulse.mail.simulation-mode:true}")
    private boolean simulationMode;

    @Value("${taskpulse.mail.from-address:notifications@taskpulse.internal}")
    private String fromAddress;

    @Value("${taskpulse.mail.from-name:TaskPulse Team}")
    private String fromName;

    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("MMM dd, yyyy");

    /**
     * Trigger 1: Task Assigned -> Dispatches email to Mentor with Task details and Due Date
     */
    @Async
    public void sendTaskAssignedEmail(Task task) {
        User mentor = task.getMentor();
        User assignee = task.getAssignee();
        User manager = task.getManager();

        String subject = String.format("📋 [New Task Assigned] - %s | Due: %s", 
                task.getTitle(), task.getDueDate().format(DATE_FORMATTER));

        String html = "<!DOCTYPE html><html><body style='font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; padding: 24px; color: #1e293b;'>"
                + "<div style='max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);'>"
                + "  <div style='background: linear-gradient(135deg, #3b82f6, #1d4ed8); padding: 24px; color: white;'>"
                + "    <h2 style='margin: 0; font-size: 20px; font-weight: 700;'>TaskPulse Notification</h2>"
                + "    <p style='margin: 6px 0 0 0; opacity: 0.9; font-size: 14px;'>New Mentorship Oversight Assignment</p>"
                + "  </div>"
                + "  <div style='padding: 24px;'>"
                + "    <p style='font-size: 15px;'>Hello <strong>" + mentor.getFullName() + "</strong>,</p>"
                + "    <p style='font-size: 14px; line-height: 1.5;'>A new task has been assigned to your mentee by <strong>" + manager.getFullName() + "</strong>. Please oversee its progress and update the status as work progresses.</p>"
                + "    <div style='background: #f1f5f9; border-radius: 8px; padding: 16px; margin: 20px 0; border-left: 4px solid #3b82f6;'>"
                + "      <div style='font-size: 16px; font-weight: 700; color: #0f172a; margin-bottom: 8px;'>" + task.getTitle() + "</div>"
                + "      <p style='font-size: 13px; color: #475569; margin: 0 0 12px 0;'>" + (task.getDescription() != null ? task.getDescription() : "No detailed description.") + "</p>"
                + "      <table style='width: 100%; font-size: 13px; border-collapse: collapse;'>"
                + "        <tr><td style='padding: 4px 0; color: #64748b;'><strong>Assignee (Mentee):</strong></td><td style='padding: 4px 0; color: #0f172a; font-weight: 600;'>" + assignee.getFullName() + " (" + assignee.getEmail() + ")</td></tr>"
                + "        <tr><td style='padding: 4px 0; color: #64748b;'><strong>Priority:</strong></td><td style='padding: 4px 0; color: #b91c1c; font-weight: 700;'>" + task.getPriority() + "</td></tr>"
                + "        <tr><td style='padding: 4px 0; color: #64748b;'><strong>Task Due Date:</strong></td><td style='padding: 4px 0; color: #1d4ed8; font-weight: 700; font-size: 14px;'>" + task.getDueDate().format(DATE_FORMATTER) + "</td></tr>"
                + "        <tr><td style='padding: 4px 0; color: #64748b;'><strong>Initial Status:</strong></td><td style='padding: 4px 0; color: #475569; font-weight: 600;'>" + task.getStatus() + "</td></tr>"
                + "      </table>"
                + "    </div>"
                + "    <p style='font-size: 13px; color: #64748b;'>As the designated mentor, you have permission in TaskPulse to transition the status from <code>PENDING</code> to <code>IN_PROGRESS</code> and finally to <code>COMPLETED</code> when verified.</p>"
                + "  </div>"
                + "  <div style='background: #f8fafc; padding: 16px 24px; border-top: 1px solid #e2e8f0; font-size: 12px; color: #94a3b8; text-align: center;'>"
                + "    Sent automatically by TaskPulse Mentorship System • Manager: " + manager.getFullName()
                + "  </div>"
                + "</div></body></html>";

        dispatchEmail(mentor.getEmail(), mentor.getFullName(), subject, html, "TASK_ASSIGNED_TO_MENTOR", task.getId());
    }

    /**
     * Trigger 2: Task Completed by Mentor -> Dispatches email reminder to Manager (You)
     */
    @Async
    public void sendTaskCompletedEmail(Task task) {
        User manager = task.getManager();
        User mentor = task.getMentor();
        User assignee = task.getAssignee();

        String subject = String.format("🎉 [Task Completed] - %s | Signed off by %s", 
                task.getTitle(), mentor.getFullName());

        String html = "<!DOCTYPE html><html><body style='font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; padding: 24px; color: #1e293b;'>"
                + "<div style='max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);'>"
                + "  <div style='background: linear-gradient(135deg, #10b981, #047857); padding: 24px; color: white;'>"
                + "    <h2 style='margin: 0; font-size: 20px; font-weight: 700;'>Task Completed &amp; Verified</h2>"
                + "    <p style='margin: 6px 0 0 0; opacity: 0.9; font-size: 14px;'>Action Complete Reminder for Manager</p>"
                + "  </div>"
                + "  <div style='padding: 24px;'>"
                + "    <p style='font-size: 15px;'>Hello <strong>" + manager.getFullName() + "</strong>,</p>"
                + "    <p style='font-size: 14px; line-height: 1.5;'>This is an automated reminder that the task assigned to <strong>" + assignee.getFullName() + "</strong> has been officially marked as <span style='background:#dcfce7; color:#15803d; padding:2px 8px; border-radius:4px; font-weight:700;'>COMPLETED</span> by their mentor <strong>" + mentor.getFullName() + "</strong>.</p>"
                + "    <div style='background: #f0fdf4; border-radius: 8px; padding: 16px; margin: 20px 0; border-left: 4px solid #10b981;'>"
                + "      <div style='font-size: 16px; font-weight: 700; color: #064e3b; margin-bottom: 8px;'>" + task.getTitle() + "</div>"
                + "      <table style='width: 100%; font-size: 13px; border-collapse: collapse;'>"
                + "        <tr><td style='padding: 4px 0; color: #64748b;'><strong>Completed By:</strong></td><td style='padding: 4px 0; color: #0f172a; font-weight: 600;'>" + assignee.getFullName() + "</td></tr>"
                + "        <tr><td style='padding: 4px 0; color: #64748b;'><strong>Verified by Mentor:</strong></td><td style='padding: 4px 0; color: #0f172a; font-weight: 600;'>" + mentor.getFullName() + " (" + mentor.getEmail() + ")</td></tr>"
                + "        <tr><td style='padding: 4px 0; color: #64748b;'><strong>Original Due Date:</strong></td><td style='padding: 4px 0; color: #475569;'>" + task.getDueDate().format(DATE_FORMATTER) + "</td></tr>"
                + "        <tr><td style='padding: 4px 0; color: #64748b;'><strong>Mentor Review Notes:</strong></td><td style='padding: 4px 0; color: #065f46; font-style: italic;'>" + (task.getMentorNotes() != null && !task.getMentorNotes().isBlank() ? task.getMentorNotes() : "Task reviewed and approved.") + "</td></tr>"
                + "      </table>"
                + "    </div>"
                + "    <p style='font-size: 13px; color: #64748b;'>You can now review the deliverables in the TaskPulse dashboard or close out this project milestone.</p>"
                + "  </div>"
                + "  <div style='background: #f8fafc; padding: 16px 24px; border-top: 1px solid #e2e8f0; font-size: 12px; color: #94a3b8; text-align: center;'>"
                + "    TaskPulse Automated Manager Notification • Real-time Delivery"
                + "  </div>"
                + "</div></body></html>";

        dispatchEmail(manager.getEmail(), manager.getFullName(), subject, html, "TASK_COMPLETED_TO_MANAGER", task.getId());
    }

    /**
     * Trigger 3: Deadline Approaching Reminder -> Dispatches to Mentor & Assignee
     */
    @Async
    public void sendDeadlineReminderEmail(Task task) {
        User mentor = task.getMentor();
        User assignee = task.getAssignee();

        String subject = String.format("⏰ [Deadline Reminder] - %s due on %s", 
                task.getTitle(), task.getDueDate().format(DATE_FORMATTER));

        String html = "<!DOCTYPE html><html><body style='font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; padding: 24px; color: #1e293b;'>"
                + "<div style='max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; border: 1px solid #fde68a; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);'>"
                + "  <div style='background: linear-gradient(135deg, #f59e0b, #d97706); padding: 24px; color: white;'>"
                + "    <h2 style='margin: 0; font-size: 20px; font-weight: 700;'>Task Due Date Approaching</h2>"
                + "    <p style='margin: 6px 0 0 0; opacity: 0.9; font-size: 14px;'>Automated Deadline Alert</p>"
                + "  </div>"
                + "  <div style='padding: 24px;'>"
                + "    <p style='font-size: 14px;'>This is a reminder that the task <strong>" + task.getTitle() + "</strong> is due on <strong>" + task.getDueDate().format(DATE_FORMATTER) + "</strong> and currently in status: <strong>" + task.getStatus() + "</strong>.</p>"
                + "    <p style='font-size: 13px; color: #64748b;'>Mentor: " + mentor.getFullName() + " | Assignee: " + assignee.getFullName() + "</p>"
                + "  </div>"
                + "</div></body></html>";

        dispatchEmail(mentor.getEmail(), mentor.getFullName(), subject, html, "DEADLINE_REMINDER_TO_MENTOR", task.getId());
        dispatchEmail(assignee.getEmail(), assignee.getFullName(), subject, html, "DEADLINE_REMINDER_TO_ASSIGNEE", task.getId());
    }

    private void dispatchEmail(String toEmail, String toName, String subject, String htmlContent, String triggerEvent, Long taskId) {
        String deliveryStatus = "SIMULATED_SUCCESS";

        if (!simulationMode && mailSender != null) {
            try {
                MimeMessage message = mailSender.createMimeMessage();
                MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
                helper.setFrom(fromAddress, fromName);
                helper.setTo(toEmail);
                helper.setSubject(subject);
                helper.setText(htmlContent, true);
                mailSender.send(message);
                deliveryStatus = "SENT_VIA_SMTP";
                logger.info("Sent real SMTP email to {} with subject: '{}'", toEmail, subject);
            } catch (Exception ex) {
                logger.error("Failed to send SMTP email to {}: {}", toEmail, ex.getMessage());
                deliveryStatus = "SMTP_FAILED: " + ex.getMessage();
            }
        } else {
            logger.info("[EMAIL SIMULATION] To: {} | Subject: '{}' | Trigger: {}", toEmail, subject, triggerEvent);
        }

        // Always store in database outbox for audit tracking & UI inspector
        SentEmailRecord record = new SentEmailRecord(
                toEmail, toName, subject, htmlContent, triggerEvent, taskId, deliveryStatus);
        emailRecordRepository.save(record);
    }
}


package com.taskpulse.service;

import com.taskpulse.model.Task;
import com.taskpulse.repository.TaskRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
public class TaskReminderScheduler {

    private static final Logger logger = LoggerFactory.getLogger(TaskReminderScheduler.class);

    @Autowired
    private TaskRepository taskRepository;

    @Autowired
    private EmailNotificationService emailNotificationService;

    @Autowired
    private NotificationService notificationService;

    /**
     * Daily Scheduled Job: Checks tasks due tomorrow or overdue and dispatches alerts
     */
    @Scheduled(cron = "${taskpulse.scheduling.deadline-cron:0 0 9 * * *}")
    public int checkAndDispatchDeadlineReminders() {
        LocalDate deadlineThreshold = LocalDate.now().plusDays(1);
        List<Task> pendingTasks = taskRepository.findOverdueOrApproachingDeadline(deadlineThreshold);

        logger.info("Running Task Reminder Job: Found {} tasks requiring deadline reminders", pendingTasks.size());

        for (Task task : pendingTasks) {
            // Send In-App warnings
            notificationService.createNotification(
                    task.getMentor(),
                    task.getId(),
                    "DEADLINE_WARNING",
                    "Task Approaching Deadline: " + task.getTitle(),
                    String.format("Task assigned to %s is due on %s. Current status: %s.", 
                            task.getAssignee().getFullName(), task.getDueDate(), task.getStatus())
            );

            // Send Email alerts
            emailNotificationService.sendDeadlineReminderEmail(task);
        }

        return pendingTasks.size();
    }
}


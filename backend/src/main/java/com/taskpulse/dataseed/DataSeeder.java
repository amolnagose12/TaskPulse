package com.taskpulse.dataseed;

import com.taskpulse.model.*;
import com.taskpulse.repository.NotificationRepository;
import com.taskpulse.repository.SentEmailRecordRepository;
import com.taskpulse.repository.TaskAuditLogRepository;
import com.taskpulse.repository.TaskRepository;
import com.taskpulse.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Component
public class DataSeeder implements CommandLineRunner {

    private static final Logger logger = LoggerFactory.getLogger(DataSeeder.class);

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private TaskRepository taskRepository;

    @Autowired
    private TaskAuditLogRepository auditLogRepository;

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private SentEmailRecordRepository emailRecordRepository;

    @Override
    public void run(String... args) {
        if (userRepository.count() > 0) {
            return; // Data already exists
        }

        logger.info("Initializing TaskPulse demo seed data...");

        // 1. Create Users
        User manager = new User(
                "Alex Morgan",
                "alex.morgan@company.com",
                Role.MANAGER,
                "Engineering Management",
                "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150"
        );
        userRepository.save(manager);

        User mentorSarah = new User(
                "Dr. Sarah Chen",
                "sarah.chen@company.com",
                Role.MENTOR,
                "Frontend Platform",
                "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150"
        );
        userRepository.save(mentorSarah);

        User mentorMarcus = new User(
                "Marcus Vance",
                "marcus.vance@company.com",
                Role.MENTOR,
                "Backend Architecture",
                "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150"
        );
        userRepository.save(mentorMarcus);

        User memberDavid = new User(
                "David Miller",
                "david.miller@company.com",
                Role.MEMBER,
                "UI Engineering",
                "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150"
        );
        userRepository.save(memberDavid);

        User memberElena = new User(
                "Elena Rostova",
                "elena.rostova@company.com",
                Role.MEMBER,
                "Core Backend",
                "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150"
        );
        userRepository.save(memberElena);

        User memberSamir = new User(
                "Samir Patel",
                "samir.patel@company.com",
                Role.MEMBER,
                "Data Platform",
                "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150"
        );
        userRepository.save(memberSamir);

        // 2. Create Tasks
        // Task 1: Pending (Due in 3 days)
        Task task1 = new Task(
                "Implement OAuth2 / SSO Authentication Flow",
                "Integrate Google and GitHub OAuth2 authorization code flow with PKCE and JWT refresh rotation.",
                TaskPriority.HIGH,
                LocalDate.now().plusDays(3),
                manager,
                memberElena,
                mentorMarcus
        );
        taskRepository.save(task1);

        auditLogRepository.save(new TaskAuditLog(
                task1, manager, null, TaskStatus.PENDING, "Task created and assigned to Elena under Mentor Marcus"
        ));

        // Task 2: In Progress (Due tomorrow)
        Task task2 = new Task(
                "Build Interactive Metrics Visualization Dashboard",
                "Develop responsive chart widgets showing sprint velocity, burndown, and mentor review cycle times.",
                TaskPriority.URGENT,
                LocalDate.now().plusDays(1),
                manager,
                memberDavid,
                mentorSarah
        );
        task2.setStatus(TaskStatus.IN_PROGRESS);
        task2.setMentorNotes("Design mockups reviewed. David started component scaffolding with Lucide icons and Tailwind.");
        taskRepository.save(task2);

        auditLogRepository.save(new TaskAuditLog(
                task2, manager, null, TaskStatus.PENDING, "Task created"
        ));
        auditLogRepository.save(new TaskAuditLog(
                task2, mentorSarah, TaskStatus.PENDING, TaskStatus.IN_PROGRESS, "Sprint kickoff approved by Dr. Sarah Chen"
        ));

        // Task 3: Completed
        Task task3 = new Task(
                "Optimize PostgreSQL Indexing for Notification Feeds",
                "Analyze slow query logs, add composite index on (recipient_id, is_read, created_at), verify p95 latency under 15ms.",
                TaskPriority.MEDIUM,
                LocalDate.now().minusDays(1),
                manager,
                memberElena,
                mentorMarcus
        );
        task3.setStatus(TaskStatus.COMPLETED);
        task3.setMentorNotes("Benchmarked p95 response time down from 145ms to 11ms. Query plan verified. Excellent work!");
        task3.setCompletedAt(LocalDateTime.now().minusHours(4));
        taskRepository.save(task3);

        auditLogRepository.save(new TaskAuditLog(
                task3, mentorMarcus, TaskStatus.IN_PROGRESS, TaskStatus.COMPLETED, "Approved & Signed off"
        ));

        // Seed initial Outbox email records
        emailRecordRepository.save(new SentEmailRecord(
                mentorMarcus.getEmail(),
                mentorMarcus.getFullName(),
                "📋 [New Task Assigned] - Implement OAuth2 / SSO Authentication Flow | Due: " + task1.getDueDate(),
                "<div>Seeded notification for mentor with due date " + task1.getDueDate() + "</div>",
                "TASK_ASSIGNED_TO_MENTOR",
                task1.getId(),
                "SIMULATED_SUCCESS"
        ));

        emailRecordRepository.save(new SentEmailRecord(
                manager.getEmail(),
                manager.getFullName(),
                "🎉 [Task Completed] - Optimize PostgreSQL Indexing for Notification Feeds | Signed off by Marcus Vance",
                "<div>Seeded completion reminder email for manager</div>",
                "TASK_COMPLETED_TO_MANAGER",
                task3.getId(),
                "SIMULATED_SUCCESS"
        ));

        // Seed notifications
        notificationRepository.save(new Notification(
                mentorSarah,
                task2.getId(),
                "TASK_ASSIGNED",
                "Mentorship Task Assigned",
                "You are mentoring 'Build Interactive Metrics Visualization Dashboard' assigned to David Miller."
        ));

        notificationRepository.save(new Notification(
                manager,
                task3.getId(),
                "TASK_COMPLETED",
                "Task Completed: Optimize PostgreSQL Indexing",
                "Marcus Vance verified and marked task completed for Elena Rostova."
        ));

        logger.info("TaskPulse seed data initialized successfully: 6 Users, 3 Tasks, Sample Audit & Outbox Logs.");
    }
}


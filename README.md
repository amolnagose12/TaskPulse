# ⚡ TaskPulse: Team Task & Mentorship Management System

> **A collaborative task tracking and mentorship oversight platform built with React, Vite, Tailwind CSS, and Spring Boot 3.**

---

## 📖 The 4 Dimensions: Why, What, How & When

```
       ┌────────────────────────────────────────────────────────┐
       │                       WHY                      │
       │  Bridging the gap between Managers, Mentors, & Mentees │
       └───────────▲────────────────────────────────▲───────────┘
                   │                                │
┌──────────────────┴─────────────┐    ┌─────────────┴──────────────────┐
│              WHAT              │    │              HOW               │
│ • React Kanban & Email Outbox  │    │ • Spring Boot 3 REST + Security│
│ • Spring JPA Entities & H2/PG  │    │ • Async HTML Email Dispatch    │
│ • Seeded Demo Personas         │    │ • Strict Mentor RBAC Guard     │
└──────────────────┬─────────────┘    └─────────────┬──────────────────┘
                   │                                │
       ┌───────────▼────────────────────────────────▼───────────┐
       │                       WHEN                     │
       │  • On Task Creation ──> Email to Mentor with Due Date  │
       │  • On Status Complete ──> Email Reminder to Manager    │
       │  • Daily 9:00 AM Cron ──> Deadline Approaching Notice  │
       └────────────────────────────────────────────────────────┘
```

---

### 1. WHY (Architectural & Business Drivers)

* **Mentorship as a Quality Gate**: Junior team members (mentees) need guidance. Allowing assignees to arbitrarily mark tasks as "Done" leads to unverified work. In TaskPulse, the **Mentor is the explicit authority** who transitions tasks from `PENDING` $\rightarrow$ `IN_PROGRESS` $\rightarrow$ `COMPLETED`.
* **Manager Visibility without Micro-Management**: Managers assign tasks and set hard deadlines. Instead of having to constantly ask for status updates, the system automatically emails the Manager the moment the Mentor verifies and signs off on the task.
* **Proactive Deadline Awareness**: The Mentor receives the task due date directly in an email the moment it is assigned, allowing them to schedule review time before deadlines lapse.
* **Zero-Setup Local Testing**: To ensure immediate usability without having to configure AWS SES or Gmail SMTP credentials, TaskPulse includes an **in-memory and database-backed Email Outbox Inspector** that renders and archives the exact HTML emails. If real SMTP credentials are provided, it seamlessly switches to real email delivery.

---

### 2. WHAT (System Components & Modules)

```
team-task-tracker/
├── backend/                      # Spring Boot 3.3.4 (Java 17)
│   ├── src/main/java/com/taskpulse/
│   │   ├── config/               # CORS & Async/Scheduling Configurations
│   │   ├── model/                # User, Task, TaskAuditLog, Notification, SentEmailRecord
│   │   ├── repository/           # Spring Data JPA Repositories
│   │   ├── dto/                  # Request / Response Data Transfer Objects
│   │   ├── service/              # TaskService, EmailNotificationService, NotificationService, TaskReminderScheduler
│   │   ├── controller/           # TaskController, UserController, NotificationController, EmailAuditController
│   │   └── dataseed/             # Automatic Data Seeder (6 Users, 3 Tasks, Sample Audit & Email Records)
│   └── pom.xml
│
├── frontend/                     # React 18 + Vite + Tailwind CSS
│   ├── src/
│   │   ├── components/           # Header (Role Switcher), KanbanBoard, CreateTaskModal, MentorStatusModal, EmailOutboxView, AnalyticsView
│   │   ├── context/              # AppContext (global state, active persona, notifications)
│   │   ├── services/             # Axios/Fetch API client
│   │   └── App.jsx               # Tab Router & Toast notifications
│   └── package.json
│
├── start.sh                      # One-click startup script
└── README.md                     # Master Documentation
```

#### Seeded Personas Available for Live Testing:
| Name | Role | Department | Testing Capability |
| :--- | :--- | :--- | :--- |
| **Alex Morgan** | `MANAGER` | Engineering Management | Can create new tasks, set due dates, assign mentors, view team velocity & metrics. |
| **Dr. Sarah Chen** | `MENTOR` | Frontend Platform | Supervises David Miller; can update task status and provide sign-off notes. |
| **Marcus Vance** | `MENTOR` | Backend Architecture | Supervises Elena Rostova; can update task status and approve backend PRs. |
| **Elena Rostova** | `MEMBER` | Core Backend | Assignee / Mentee; views deadlines and pending deliverables. |
| **David Miller** | `MEMBER` | UI Engineering | Assignee / Mentee; works on UI visualizations. |

---

### 3. HOW (Technical Implementation & Protocols)

#### A. Mentor Status Guard (RBAC Security)
Only the designated mentor or the manager can change task status. If a mentee or unrelated user attempts to call the API:
```java
// Handled in TaskService.java:
boolean isAssignedMentor = task.getMentor().getId().equals(actor.getId());
boolean isManager = task.getManager().getId().equals(actor.getId()) || actor.getRole() == Role.MANAGER;

if (!isAssignedMentor && !isManager) {
    throw new ResponseStatusException(HttpStatus.FORBIDDEN, 
        "Permission denied: Only the assigned Mentor (" + task.getMentor().getFullName() 
        + ") or Manager can update status.");
}
```

#### B. Asynchronous HTML Email Dispatch
Emails are generated with rich HTML styling and dispatched asynchronously (`@Async`) so API calls return in under 20ms:
```java
@Async
public void sendTaskCompletedEmail(Task task) {
    // Renders responsive HTML template with Mentor's review notes
    dispatchEmail(task.getManager().getEmail(), task.getManager().getFullName(), subject, html, "TASK_COMPLETED_TO_MANAGER", task.getId());
}
```

---

### 4. WHEN (Lifecycle Triggers)

| Event | WHEN Does It Trigger? | Action & Side-Effect |
| :--- | :--- | :--- |
| **1. Task Creation** | When Manager submits the "Assign Task" form. | 1. Task saved in `PENDING` state.<br>2. Audit log recorded.<br>3. **Email dispatched to Mentor with Task details & Due Date**.<br>4. In-app bell notification added. |
| **2. Mentor Kickoff** | When Mentor clicks "Start Task". | 1. Status updated to `IN_PROGRESS`.<br>2. Mentee notified that kickoff is approved.<br>3. Audit log updated with mentor notes. |
| **3. Mentor Sign-Off** | When Mentor clicks "Complete & Notify Manager". | 1. Status updated to `COMPLETED` and `completedAt` timestamp stamped.<br>2. **Automated Sign-Off Email sent to Manager (You)**.<br>3. In-app bell notification sent to Manager. |
| **4. Daily Deadline Scan** | Every day at 9:00 AM (or via "Scan Deadlines" UI button). | Finds tasks where `dueDate <= NOW + 1 day` & `status != COMPLETED`. Dispatches warning email to Mentor and Mentee. |

---

## 🚀 Quickstart: Running the Application

### Prerequisites
* Java 17+
* Maven 3.8+
* Node.js 18+ and npm

### Option 1: One-Click Startup Script
From the project root:
```bash
cd /Users/amolnagose/.gemini/antigravity/scratch/team-task-tracker
./start.sh
```

### Option 2: Running Services Individually

#### 1. Start Spring Boot Backend:
```bash
cd /Users/amolnagose/.gemini/antigravity/scratch/team-task-tracker/backend
mvn spring-boot:run
```
* Backend runs on: `http://localhost:8080`
* H2 Database Console: `http://localhost:8080/h2-console` (JDBC URL: `jdbc:h2:mem:taskpulsedb`, User: `sa`, Password: *empty*)

#### 2. Start React Frontend:
```bash
cd /Users/amolnagose/.gemini/antigravity/scratch/team-task-tracker/frontend
npm run dev
```
* Open your browser at: **`http://localhost:5173`**

---

## 🧪 Interactive Walkthrough (How to Test Everything)

1. **Test Mentor Due Date Notification**:
   * In the top-right header, ensure you are logged in as **Alex Morgan (Manager)**.
   * Click **"+ Assign Task"**.
   * Title: *"Build Payment Webhook Receiver"*, Priority: *Urgent*, Due Date: *3 days from now*, Assignee: *Elena Rostova*, Mentor: *Marcus Vance*.
   * Click **"Assign & Notify Mentor"**.
   * Switch to the **"Email Outbox"** tab $\rightarrow$ Notice the new entry: `📋 [New Task Assigned] - Build Payment Webhook Receiver | Due: [Date]`. Click **"Inspect HTML"** to see the exact email sent to Marcus Vance!

2. **Test Mentor Status Update & Manager Email Reminder**:
   * Use the top-right dropdown to **switch persona to Marcus Vance (Mentor)**.
   * On the Kanban board, find the newly created task under **"Pending Kickoff"**.
   * Click **"Start Task"** $\rightarrow$ Moves to **"In Progress"**.
   * Click **"Complete & Notify Manager"**. Enter feedback notes: *"Code reviewed, unit tests passing with 98% coverage. Ready for staging."*
   * Click **"Sign-off & Notify Manager"** $\rightarrow$ Moves to **"Completed & Signed Off"**.
   * Switch to the **"Email Outbox"** tab $\rightarrow$ See the new alert: `🎉 [Task Completed] - Build Payment Webhook Receiver | Signed off by Marcus Vance` sent to Alex Morgan! Click **"Inspect HTML"** to view the manager sign-off reminder.

3. **Test Role Permission Security**:
   * Switch persona to **Elena Rostova (Mentee)**.
   * Notice that the status update buttons are disabled for her; the UI displays *"Mentor approval required"*. (Calling the API directly returns HTTP 403 Forbidden).

4. **Test Deadline Reminder Engine**:
   * Click the **"Scan Deadlines"** button in the header.
   * The scheduler scans for upcoming tasks and dispatches reminder notices to mentors and assignees.

---

## 📡 REST API Reference

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/users` | List all users (filter by `?role=MANAGER\|MENTOR\|MEMBER`) |
| `GET` | `/api/tasks` | List all tasks (filter by `?status=`, `?mentorId=`, etc.) |
| `POST` | `/api/tasks` | Create task (**triggers email to mentor with due date**) |
| `PATCH` | `/api/tasks/{id}/status` | Update status (**triggers email to manager on completion**) |
| `GET` | `/api/tasks/{id}/audit-logs` | Fetch chronological change log for task |
| `POST` | `/api/tasks/trigger-deadline-reminders` | Trigger deadline reminder scan on demand |
| `GET` | `/api/notifications?userId={id}` | In-app notifications feed |
| `GET` | `/api/emails/outbox` | Live email audit log with HTML body |


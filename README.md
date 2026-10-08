# Error-Free Campus
> **AI-Powered College Complaint Management & Resolution System**  
> *"Smarter Complaints. Faster Resolution. Better Campus."*

---

## 🌟 Overview
**Error-Free Campus** is a production-grade, full-stack college complaint management and resolution platform. It bridges the communication gap between students, department heads (HODs), maintenance staff, college principals, and system administrators with end-to-end transparency, SLA deadline monitoring, automated audit logging, interactive analytics, and Gemini AI-powered complaint intelligence.

---

## 🚀 Key Highlights & Features

### 1. 🤖 AI-Powered Complaint Intelligence (Google Gemini Integration)
- **Automatic Category Classification**: Analyzes complaint title and description to suggest categories (Infrastructure, Electrical, Cleanliness, Academic, etc.) with confidence scores.
- **Priority & Urgency Assessment**: Flags safety hazards as `CRITICAL` or `HIGH` automatically based on severity.
- **Department Routing**: Recommends the appropriate college department (CSE, ECE, EEE, MECH, etc.).
- **Smart Summarization & Action Plan**: Generates actionable 3-5 step resolution plans for maintenance staff.
- **Executive AI Summaries**: Provides college leadership with synthesized health metrics and issue hot-spots.
- **Graceful Fallback**: If the Gemini API key is missing or offline, the platform functions seamlessly without interrupting submission.

### 2. 👥 5-Tier Role-Based Access Control (RBAC)
- **Student**: Submit complaints with AI assistance, track real-time resolution timelines, view complaint status badges, and reopen tickets if unsatisfied.
- **Staff**: View assigned tickets, update progress status (`ASSIGNED` ➔ `IN_PROGRESS` ➔ `RESOLVED`), and log resolution notes, materials used, and actions taken.
- **HOD (Head of Department)**: Department-level visibility, assign staff members, monitor staff workloads, and escalate urgent issues.
- **Principal**: College-wide executive dashboards, multi-department comparative charts (Recharts), SLA breach trackers, and active escalations.
- **Admin**: Complete administrative control — user management, department management, category configurations, audit trails, and global analytics.

### 3. 🎨 Design Language (Modern SaaS Dashboard)
- Soft lavender-blue backdrop (`#F4F6FF`) with crisp white card surfaces (`#FFFFFF`).
- Indigo-Purple primary accent (`#635BFF`) & Blue secondary accent (`#4F7CFF`).
- Smooth 16px–24px rounded corners, subtle elevation shadows, responsive mobile drawer, and Lucide icons.

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 18, Vite, React Router v6, Tailwind CSS, Lucide React, Recharts, React Hot Toast, Axios |
| **Backend** | Java 17, Spring Boot 3.2.x, Spring Security 6, JWT (jjwt), Spring Data JPA, Hibernate, WebFlux WebClient |
| **Database** | PostgreSQL (DDL auto-update, relational entities, audit logs, timelines) |
| **AI Engine** | Google Gemini REST API (`gemini-pro`) with error resilience and fallback |

---

## 📂 Project Structure

```
error-free-campus/
├── backend/
│   ├── pom.xml
│   ├── .env.example
│   └── src/main/
│       ├── resources/
│       │   └── application.properties
│       └── java/com/college/complaint/
│           ├── ComplaintManagementApplication.java
│           ├── ai/             # AiService (Gemini API client + fallbacks)
│           ├── config/         # SecurityConfig, CorsConfig, DataInitializer
│           ├── controller/     # Auth, Complaint, Student, Staff, Hod, Principal, Admin, Notifications, AI, Public, Profile
│           ├── dto/            # Request and Response DTOs
│           ├── entity/         # User, Complaint, Department, Category, Notification, AuditLog, AiAnalysis, Escalation, etc.
│           ├── exception/      # ResourceNotFoundException, UnauthorizedException, GlobalExceptionHandler
│           ├── repository/     # Spring Data JPA Repositories
│           ├── security/       # JWT Token Provider, Auth Filter, UserPrincipal, CustomUserDetailsService
│           └── service/        # ComplaintService, UserService, DepartmentCategoryService, AnalyticsService, NotificationService, AuditLogService, AuthService
└── frontend/
    ├── package.json
    ├── vite.config.js
    ├── tailwind.config.js
    ├── postcss.config.js
    ├── index.html
    └── src/
        ├── main.jsx
        ├── App.jsx
        ├── index.css
        ├── context/           # AuthContext (JWT persistence, role routing)
        ├── services/          # Axios instances and API services
        ├── utils/             # Formatters, constants, color mappings
        ├── components/
        │   ├── ui/            # StatCard, StatusBadge, PriorityBadge, Modal, EmptyState, Skeleton, Spinner
        │   └── layout/        # Sidebar, Header, MobileSidebar, DashboardLayout
        └── pages/
            ├── auth/          # LoginPage, UnauthorizedPage
            ├── student/       # StudentDashboard, CreateComplaint, MyComplaints, ComplaintDetails
            ├── staff/         # StaffDashboard, AssignedComplaints
            ├── hod/           # HodDashboard, DepartmentComplaints, StaffAssignment
            ├── principal/     # PrincipalDashboard, AllComplaints, PrincipalAnalytics, Escalations
            ├── admin/         # AdminDashboard, UserManagement, DepartmentManagement, CategoryManagement, AdminComplaints, AdminAnalytics, AuditLogs
            └── shared/        # NotificationsPage, ProfilePage
```

---

## ⚡ Quick Start Guide

### 1. Database Setup
Make sure PostgreSQL is running on port `5432` with a database named `error_free_campus`:
```sql
CREATE DATABASE error_free_campus;
```

### 2. Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Configure your environment variables in `.env` or edit `src/main/resources/application.properties`:
   ```properties
   spring.datasource.url=jdbc:postgresql://localhost:5432/error_free_campus
   spring.datasource.username=postgres
   spring.datasource.password=password

   jwt.secret=errorfreecampussecretkey2024verylongstringforhmacsha256algorithm
   ai.api.key=YOUR_GEMINI_API_KEY
   ```
3. Run the Spring Boot application:
   ```bash
   mvn spring-boot:run
   ```
   > **Note**: On first boot, the `DataInitializer` automatically populates sample departments, categories, demo users, sample complaints, and initial notifications.

### 3. Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
4. Access the web application at `http://localhost:5173`.

---

## 🔑 Demo Accounts

Use any of the seeded accounts to log in directly:

| Role | Email | Password | Scope |
|---|---|---|---|
| **Student** | `student@college.edu` | `Student@123` | Submit and track personal complaints |
| **Staff** | `staff@college.edu` | `Staff@123` | Resolve assigned issues & log work |
| **HOD** | `hod@college.edu` | `Hod@123` | Department complaints & staff allocation |
| **Principal** | `principal@college.edu` | `Principal@123` | College-wide metrics, SLA, escalations |
| **Admin** | `admin@college.edu` | `Admin@123` | Global system control, users & audit logs |

---

## 🛡️ Security & Architecture
- **Stateless Authentication**: Tokens signed using HMAC-SHA256 with 24-hour expiration.
- **Route Guards**: Dual-layer protection — client-side route shielding in React + Spring Security `@PreAuthorize` method validation on REST APIs.
- **Audit Trails**: Every administrative action, assignment, and status transition is recorded in PostgreSQL with timestamp and user tracking.
- **SLA Deadline Calculations**: Priority-driven due dates (Critical: 4 hrs, High: 24 hrs, Medium: 3 days, Low: 7 days) with automated overdue alerts.

# Phase 1: Foundation & Core Class Management

## Objectives
The goal of Phase 1 is to build the **Minimum Viable Product (MVP)** that allows organizations to manage mentoring classes effectively. We will focus on the "Happy Path" for Managers, Mentors, and Mentees.

**Key Goals:**
1.  Establish the technical infrastructure.
2.  Enable secure user onboarding (Auth & Reg).
3.  Facilitate the core mentoring loop: **Class -> Session -> Attendance**.

---

## Prioritized Modules

### 1. System Foundation (Technical)
Before any features, the skeleton must be ready.
-   **Tech Stack**: Next.js (Frontend), NestJS (Backend), PostgreSQL + Prisma (DB).
-   **Infrastructure**: Cloudflare R2 setup.

### 2. Authentication & User Management
Users must be able to enter the system securely.
-   **Auth**: JWT-based Login, Password Recovery.
-   **Registration**:
    -   **Mentee**: Direct registration + Email Verification.
    -   **Mentor**: Registration + Approval Workflow (Manager review).
-   **RBAC**: Role-based access control (Super Admin, Manager, Mentor, Mentee).

### 3. Organization Management (Basic)
Required because Classes belong to Organizations.
-   **Manager**: Create/Edit Organization.
-   **Members**: View list of mentors/mentees in the org.

### 4. Class Management (The Core)
This is the main value proposition.
-   **Class Setup**: Create Class, Assign Mentors.
-   **Enrollment**: Generate Class Code, Mentee Join via Code.
-   **Sessions**: Schedule Meetings (Online/Offline).
-   **Attendance**: Self Check-in mechanism for Mentees.

---

## Development Plan (Task List)

### Sprint 1: Setup & Auth
- [ ] **Repo Init**: Setup Monorepo (or separate) for Client/Server.
- [ ] **DB Design**: Define initial Prisma schema (User, Role, Org, Class, Session).
- [ ] **Backend Auth**: Implement `AuthService` (Login, Register, Verify Email).
- [ ] **Frontend Auth**: Build Login/Register pages with Form Validation (Zod).
- [ ] **Email Integration**: Setup Resend for sending verification codes.

### Sprint 2: User Roles & Organization
- [ ] **Mentor Approval**: Backend API for Managers to approve/reject mentor signups.
- [ ] **Manager Dashboard**: UI to view pending mentor applications.
- [ ] **Org CRUD**: Basic API to create and manage an organization profile.
- [ ] **Profile**: Basic user profile page (Upload Avatar, Edit Bio).

### Sprint 3: Class & Enrollment
- [ ] **Class API**: CRUD for Classes.
- [ ] **Class UI**: Manager/Mentor view to create classes and see details.
- [ ] **Enrollment Logic**: Backend logic for "Join by Code".
- [ ] **Mentee Dashboard**: UI to enter code and see joined classes.

### Sprint 4: Sessions & Attendance
- [ ] **Session Management**: Create/Edit sessions within a class.
- [ ] **Schedule View**: List upcoming sessions for Mentors/Mentees.
- [ ] **Check-in System**:
    -   Backend: API to handle check-in (time validation).
    -   Frontend: "Check-in" button active only during the window.
- [ ] **Attendance List**: Mentor view to see who attended.

---

## What is NOT in Phase 1 (Deferred)
-   **LMS**: Course creation, assignments, quizzes (Phase 2).
-   **Global Forum**: Public discussions outside of classes (Phase 2).
-   **Advanced Analytics**: Detailed charts/graphs (Phase 3).
-   **Certificates**: Auto-generation of PDFs (Phase 3).

# Product Requirements Document (PRD)
# BelajarShafa - Mentoring Management System

**Version:** 1.0  
**Last Updated:** November 22, 2025  
**Status:** In Progress  
**Language:** Bahasa Indonesia

---

## Table of Contents

1. [Overview & Objectives](#1-overview--objectives)
2. [User Roles & Permissions](#2-user-roles--permissions)
3. [Module Specifications](#3-module-specifications)
4. [User Journeys](#4-user-journeys)
5. [Technical Documentation](#5-technical-documentation)

---

## 1. Overview & Objectives

Sistem manajemen mentoring berbahasa Indonesia yang memfasilitasi organisasi untuk mengelola program mentoring mereka, lengkap dengan fitur manajemen kelas, pembelajaran (LMS), komunikasi global, dan tracking progress mentee.

### Target Users
- **Super Admin** - Sistem administrator
- **Manager** - Pemilik organisasi
- **Mentor** - Pembimbing/pengajar
- **Mentee** - Peserta/siswa

### Key Features
- Multi-mentor class management
- Self check-in attendance system
- Learning Management System dengan course assignment
- Global forum diskusi (standalone, tidak terikat kelas)
- Progress tracking & analytics
- Certificate generation

---

## 2. User Roles & Permissions

### 2.1 Super Admin
- Mengelola seluruh sistem
- Manajemen user roles
- Monitoring seluruh organisasi

### 2.2 Manager
- Membuat dan mengelola organisasi
- Membuat kelas di dalam organisasi dan assign multiple mentors
- Melihat statistik dan laporan organisasi
- Mengelola course/kurikulum
- Assign course ke kelas tertentu (mandatory/optional)
- Assign moderator role untuk forum global

### 2.3 Mentor
- Mengelola kelas yang dimiliki (bersama mentor lain)
- Mengelola sesi pertemuan dan presensi
- Membuat catatan perkembangan mentee
- Mengakses course untuk pembelajaran
- Melihat progress belajar mentee
- Assign course ke kelas
- Moderasi forum global (jika memiliki role moderator)

### 2.4 Mentee
- Bergabung ke kelas melalui kode undangan
- Self check-in untuk presensi
- Melihat history presensi dan sesi pertemuan
- Mengakses dan menyelesaikan course (yang di-assign atau umum)
- Mengelola profil pribadi
- Berpartisipasi dalam forum diskusi global

---

## 3. Module Specifications

Detailed functional and non-functional requirements for each module:

### 3.1 Authentication & Registration
📄 **[Module_Auth.md](Module/Module_Auth.md)**
- Login system
- Session management
- Password recovery

📄 **[Module_Registration.md](Module/Module_Registration.md)**
- Mentee registration flow
- Mentor registration with approval
- Email verification
- Profile completion

### 3.2 Organization Management
📄 **[Module_Organization.md](Module/Module_Organization.md)**
- Organization creation and settings
- Member management
- Organization analytics

### 3.3 Class Management
📄 **[Module_Class_Management.md](Module/Module_Class_Management.md)**
- Class creation and configuration
- Multi-mentor assignment
- Session scheduling
- Attendance tracking (self check-in)
- Mentee notes and progress tracking

### 3.4 Learning Management System (LMS)
📄 **[Module_LMS.md](Module/Module_LMS.md)**
- Course creation and management
- Topics and materials
- Quizzes and assessments
- Course assignment to classes
- Progress tracking
- Certificate generation

### 3.5 Communication (Global Forum)
📄 **[Module_Communication.md](Module/Module_Communication.md)**
- Global forum (standalone, not class-specific)
- Thread creation with tags
- Nested comments (up to 3 levels)
- Upvote/downvote system
- Moderation tools
- User reputation and badges
- Bookmarks and following

### 3.6 User Profile
📄 **[Module_Profile.md](Module/Module_Profile.md)**
- Profile management
- Avatar upload
- Skills and bio
- Activity history

---

## 4. User Journeys

User experience flows and design principles:

📄 **[Design_Principles.md](Design/Design_Principles.md)**
- UX/UI guidelines
- Design philosophy
- Accessibility standards

📄 **[Design_System.md](Design/Design_System.md)**
- Color palette & Typography
- Component specifications
- Spacing & Layout guidelines

📄 **[Manager_Journey.md](Design/Manager_Journey.md)**
- Manager onboarding
- Organization setup
- Class and course management workflows

📄 **[Mentor_Journey.md](Design/Mentor_Journey.md)**
- Mentor registration and approval
- Class management
- Session and attendance workflows
- Mentee progress tracking

📄 **[Mentee_Journey.md](Design/Mentee_Journey.md)**
- Mentee registration
- Joining classes
- Attending sessions
- Course completion
- Forum participation

---

## 5. Technical Documentation

Technical specifications, architecture, and implementation details:

### 5.1 Technology Stack
📄 **[Tech_Stack.md](Technical/Tech_Stack.md)**
- Frontend framework
- Backend framework
- Database
- Infrastructure and deployment

### 5.2 Data Model
📄 **[Data_Model.md](Technical/Data_Model.md)**
- Database schema
- Entity relationships
- Core entities:
  - Users and Organizations
  - Classes and Sessions
  - Courses and Learning
  - Forum (global)
  - Notifications

### 5.3 API Specifications
📄 **[API.md](Technical/API.md)**
- RESTful API endpoints
- Authentication endpoints
- Module-specific endpoints:
  - Organizations
  - Classes
  - LMS
  - Forum (global)
  - Notifications
- Request/response formats
- Error handling

---

## Document Structure

```
docs/
├── PRD.md (this file - index)
├── Module/
│   ├── Module_Auth.md
│   ├── Module_Registration.md
│   ├── Module_Organization.md
│   ├── Module_Class_Management.md
│   ├── Module_LMS.md
│   ├── Module_Communication.md (Global Forum)
│   └── Module_Profile.md
├── Design/
│   ├── Design_Principles.md
│   ├── Manager_Journey.md
│   ├── Mentor_Journey.md
│   └── Mentee_Journey.md
└── Technical/
    ├── Tech_Stack.md
    ├── Data_Model.md
    └── API.md
```

## Contributing

When updating documentation:
1. Keep module docs focused on functional/non-functional requirements
2. Update user journeys when flows change
3. Keep technical docs in sync with implementation
4. Update this index when adding new documents
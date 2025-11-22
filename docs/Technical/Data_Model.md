## 7. Data Model (High-Level Entities)

### 7.1 User-related
```
Users
├── id (UUID)
├── email (unique)
├── password_hash
├── role (enum: super_admin, manager, mentor, mentee)
├── name
├── phone
├── institution
├── profession
├── skills (array)
├── bio (text)
├── avatar_url
├── settings (JSON)
├── created_at
└── updated_at

Organizations
├── id (UUID)
├── name
├── description
├── logo_url
├── owner_id (FK → Users)
├── contact_info (JSON)
└── created_at

OrganizationMembers
├── id (UUID)
├── org_id (FK → Organizations)
├── user_id (FK → Users)
├── role (enum: manager, mentor)
└── joined_at
```

### 7.2 Class-related
```
Classes
├── id (UUID)
├── org_id (FK → Organizations)
├── name
├── description
├── invitation_code (unique, indexed)
├── schedule (JSON)
├── start_date
├── end_date
├── max_mentees
├── status (enum: active, archived)
└── created_at

ClassMentors
├── id (UUID)
├── class_id (FK → Classes)
├── mentor_id (FK → Users)
├── is_lead (boolean)
└── assigned_at

ClassMentees
├── id (UUID)
├── class_id (FK → Classes)
├── mentee_id (FK → Users)
├── joined_at
└── status (enum: active, inactive)

Sessions
├── id (UUID)
├── class_id (FK → Classes)
├── title
├── description
├── date_time
├── duration (minutes)
├── location
├── status (enum: scheduled, ongoing, completed, cancelled)
├── check_in_window_start
├── check_in_window_end
└── created_by (FK → Users)

SessionNotes
├── id (UUID)
├── session_id (FK → Sessions)
├── content (rich text)
├── attachments (JSON array)
├── created_by (FK → Users)
├── created_at
└── updated_at

Attendance
├── id (UUID)
├── session_id (FK → Sessions)
├── mentee_id (FK → Users)
├── status (enum: hadir, izin, sakit, alfa)
├── check_in_time
├── notes
└── created_by (FK → Users)

MenteeNotes
├── id (UUID)
├── class_id (FK → Classes)
├── mentee_id (FK → Users)
├── category (enum)
├── content (rich text)
├── rating (1-5)
├── created_by (FK → Users)
├── created_at
└── updated_at
```

### 7.3 Course-related
```
Courses
├── id (UUID)
├── title
├── description
├── thumbnail_url
├── level (enum: pemula, menengah, lanjutan)
├── duration_estimate (minutes)
├── type (enum: public, private)
├── created_by (FK → Users)
├── created_at
└── updated_at

Topics
├── id (UUID)
├── course_id (FK → Courses)
├── title
├── description
├── sequence (integer)
├── duration_estimate
└── is_mandatory (boolean)

Materials
├── id (UUID)
├── topic_id (FK → Topics)
├── type (enum: video, document, article, link)
├── title
├── content (URL/file_url/rich_text)
├── sequence
└── duration_estimate

Quizzes
├── id (UUID)
├── topic_id (FK → Topics)
├── title
├── description
├── passing_score (integer %)
├── time_limit (minutes, nullable)
├── max_attempts (integer, nullable)
└── show_answers (boolean)

QuizQuestions
├── id (UUID)
├── quiz_id (FK → Quizzes)
├── question_text
├── question_image_url
├── options (JSON array)
├── correct_answer (JSON)
├── explanation
└── points

CourseAssignments
├── id (UUID)
├── course_id (FK → Courses)
├── class_id (FK → Classes)
├── is_mandatory (boolean)
├── deadline (date, nullable)
├── assigned_by (FK → Users)
└── assigned_at

CourseEnrollments
├── id (UUID)
├── course_id (FK → Courses)
├── user_id (FK → Users)
├── enrolled_at
├── completed_at (nullable)
└── progress_percentage

MaterialProgress
├── id (UUID)
├── enrollment_id (FK → CourseEnrollments)
├── material_id (FK → Materials)
├── is_completed (boolean)
└── completed_at

QuizAttempts
├── id (UUID)
├── enrollment_id (FK → CourseEnrollments)
├── quiz_id (FK → Quizzes)
├── score (integer %)
├── answers (JSON)
├── time_spent (seconds)
├── attempt_number
└── attempted_at
```

### 7.4 Forum-related
```
ForumThreads
├── id (UUID)
├── class_id (FK → Classes)
├── author_id (FK → Users)
├── title
├── content (rich text)
├── tags (array)
├── is_pinned (boolean)
├── is_closed (boolean)
├── is_solved (boolean)
├── views_count
├── created_at
└── updated_at

ForumComments
├── id (UUID)
├── thread_id (FK → ForumThreads)
├── parent_comment_id (FK → ForumComments, nullable)
├── author_id (FK → Users)
├── content (rich text)
├── attachments (JSON)
├── created_at
└── updated_at

ForumVotes
├── id (UUID)
├── votable_id (UUID) -- thread_id or comment_id
├── votable_type (enum: thread, comment)
├── user_id (FK → Users)
├── vote_type (enum: upvote, downvote)
└── created_at
```

### 7.5 Notification-related
```
Notifications
├── id (UUID)
├── user_id (FK → Users)
├── type (enum)
├── title
├── content
├── reference_id (UUID, polymorphic)
├── reference_type (string)
├── is_read (boolean)
└── created_at
```
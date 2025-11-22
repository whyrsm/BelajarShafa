## 8. API Endpoints (High-Level)

### 8.1 Authentication
```
POST   /api/auth/register           # Register user baru
POST   /api/auth/login              # Login
POST   /api/auth/logout             # Logout
POST   /api/auth/forgot-password    # Request reset password
POST   /api/auth/reset-password     # Reset password dengan token
GET    /api/auth/verify-email/:token # Verify email
```

### 8.2 Users & Profile
```
GET    /api/users/me                # Get current user profile
PATCH  /api/users/me                # Update profile
PATCH  /api/users/me/password       # Change password
GET    /api/users/:id               # Get user profile
```

### 8.3 Organizations
```
GET    /api/organizations           # List organizations
POST   /api/organizations           # Create organization
GET    /api/organizations/:id       # Get organization detail
PATCH  /api/organizations/:id       # Update organization
DELETE /api/organizations/:id       # Delete organization
GET    /api/organizations/:id/stats # Get organization statistics
```

### 8.4 Classes
```
GET    /api/classes                 # List classes
POST   /api/classes                 # Create class
GET    /api/classes/:id             # Get class detail
PATCH  /api/classes/:id             # Update class
DELETE /api/classes/:id             # Delete class
POST   /api/classes/join            # Join class dengan invitation code
POST   /api/classes/:id/mentors     # Add mentor
DELETE /api/classes/:id/mentors/:mentorId  # Remove mentor
POST   /api/classes/:id/mentees/:menteeId/remove # Remove mentee
```

### 8.5 Sessions
```
GET    /api/classes/:classId/sessions      # List sessions
POST   /api/classes/:classId/sessions      # Create session
GET    /api/sessions/:id                   # Get session detail
PATCH  /api/sessions/:id                   # Update session
DELETE /api/sessions/:id                   # Delete session
POST   /api/sessions/:id/notes             # Add session notes
PATCH  /api/sessions/:id/notes/:noteId     # Update notes
```

### 8.6 Attendance
```
POST   /api/sessions/:sessionId/check-in   # Mentee self check-in
POST   /api/sessions/:sessionId/attendance # Mentor fill attendance (bulk)
PATCH  /api/attendance/:id                 # Update attendance record
GET    /api/classes/:classId/attendance    # Get attendance report
```

### 8.7 Mentee Notes
```
GET    /api/classes/:classId/mentee-notes  # List all mentee notes
POST   /api/classes/:classId/mentee-notes  # Create note
GET    /api/mentee-notes/:id               # Get note detail
PATCH  /api/mentee-notes/:id               # Update note
DELETE /api/mentee-notes/:id               # Delete note
```

### 8.8 Courses
```
GET    /api/courses                        # List courses
POST   /api/courses                        # Create course
GET    /api/courses/:id                    # Get course detail
PATCH  /api/courses/:id                    # Update course
DELETE /api/courses/:id                    # Delete course
POST   /api/courses/:courseId/enroll       # Enroll to course
POST   /api/courses/:courseId/assign       # Assign course to class
GET    /api/courses/:courseId/progress     # Get user progress
```

### 8.9 Topics & Materials
```
POST   /api/courses/:courseId/topics       # Create topic
PATCH  /api/topics/:id                     # Update topic
DELETE /api/topics/:id                     # Delete topic
POST   /api/topics/:topicId/materials      # Add material
PATCH  /api/materials/:id                  # Update material
DELETE /api/materials/:id                  # Delete material
POST   /api/materials/:id/complete         # Mark material as completed
```

### 8.10 Quizzes
```
POST   /api/topics/:topicId/quizzes        # Create quiz
PATCH  /api/quizzes/:id                    # Update quiz
DELETE /api/quizzes/:id                    # Delete quiz
POST   /api/quizzes/:quizId/questions      # Add question
POST   /api/quizzes/:quizId/attempt        # Start quiz attempt
POST   /api/quiz-attempts/:attemptId/submit # Submit quiz
GET    /api/quiz-attempts/:attemptId/result # Get quiz result
```

### 8.11 Progress Tracking
```
GET    /api/users/me/enrollments           # Get my enrolled courses
GET    /api/enrollments/:enrollmentId/progress # Get detailed progress
GET    /api/classes/:classId/mentees/progress # Get all mentee progress
```

### 8.12 Forum
```
GET    /api/classes/:classId/forum/threads # List threads
POST   /api/classes/:classId/forum/threads # Create thread
GET    /api/forum/threads/:id              # Get thread detail
PATCH  /api/forum/threads/:id              # Update thread
DELETE /api/forum/threads/:id              # Delete thread
POST   /api/forum/threads/:threadId/comments # Add comment
PATCH  /api/forum/comments/:id             # Update comment
DELETE /api/forum/comments/:id             # Delete comment
POST   /api/forum/threads/:threadId/vote   # Upvote/downvote thread
POST   /api/forum/comments/:commentId/vote # Upvote/downvote comment
POST   /api/forum/threads/:threadId/pin    # Pin thread
POST   /api/forum/threads/:threadId/close  # Close thread
POST   /api/forum/threads/:threadId/solved # Mark as solved
```

### 8.13 Notifications
```
GET    /api/notifications                  # List notifications
PATCH  /api/notifications/:id/read         # Mark as read
PATCH  /api/notifications/read-all         # Mark all as read
DELETE /api/notifications/:id              # Delete notification
```

### 8.14 Search
```
GET    /api/search?q=keyword&type=classes|courses|users|threads # Global search
```

---

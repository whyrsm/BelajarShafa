## Communication Module (Forum Diskusi Global)

### Konsep
- Forum diskusi global bergaya Reddit untuk seluruh platform
- Accessible oleh semua user (Mentor, Mentee, Manager)
- Thread-based discussion dengan upvote/downvote
- Moderasi oleh designated moderators (Mentor/Manager dengan role moderator)
- Notifikasi untuk engagement
- Tidak terikat dengan kelas tertentu

### Functional Requirements

#### FR-COMM-001: Forum Global
- Forum accessible oleh semua registered users di platform
- Tidak terbatas pada kelas tertentu
- Tampilan list threads:
  - Sort by: Terbaru, Popular (most upvotes), Paling banyak dibalas, Trending
  - Filter by: Tag/kategori, Status (open/closed/solved), Author, Date range
  - Search threads (by title, content, author, tags)
- Infinite scroll atau pagination (20 threads per page)

#### FR-COMM-002: Create Thread (All Users)
- Semua user dapat membuat thread baru:
  - Judul thread (required, max 200 karakter)
  - Konten (rich text editor dengan formatting: bold, italic, list, link, code block)
  - Tag/kategori (pilih dari predefined tags, max 5 tags per thread)
  - Upload gambar (max 5 gambar, 5MB each)
  - Attach file (PDF, DOC, DOCX - max 10MB)
  - Optional: Link ke kelas tertentu (jika thread terkait kelas spesifik)
- Author dapat edit/delete threadnya sendiri (dalam 24 jam)
- Draft support: save thread sebagai draft sebelum publish

#### FR-COMM-003: Reply & Nested Comments
- User dapat reply ke thread dengan:
  - Konten reply (rich text)
  - Upload gambar/file (opsional)
  - Quote bagian tertentu dari thread/comment sebelumnya
- Support nested replies hingga 3 level:
  - Thread → Comment → Reply → Reply
- User dapat edit/delete reply miliknya (dalam 24 jam)
- Tampilkan "edited" badge jika sudah diedit dengan timestamp
- Collapse/expand nested replies untuk readability

#### FR-COMM-004: Upvote/Downvote
- User dapat upvote/downvote thread dan comment
- Tampilkan skor net (upvotes - downvotes)
- User dapat ubah vote (upvote → downvote atau sebaliknya)
- Sort comments by: Top (highest score), Newest, Oldest, Controversial
- Prevent self-voting

#### FR-COMM-005: Moderation (Moderators)
- Designated moderators (Mentor/Manager dengan role moderator) dapat:
  - Pin/Unpin thread (tampil di atas, global atau per kategori)
  - Close thread (tidak bisa dibalas, hanya bisa dilihat)
  - Delete thread/comment (dengan reason yang visible)
  - Ban user dari forum (temporary atau permanent, dengan reason)
  - Move thread ke kategori yang tepat
  - Merge duplicate threads
- Manager dapat assign/remove moderator role
- Predefined tags/kategori global:
  - Pertanyaan, Diskusi, Pengumuman, Tips & Trik, Showcase, Feedback, Lain-lain
- Log aktivitas moderasi (audit trail dengan timestamp dan moderator name)

#### FR-COMM-006: Mentions & Notifications
- User dapat mention user lain dengan `@username` (autocomplete)
- Notifikasi saat:
  - Di-mention dalam thread/comment
  - Thread yang dibuat mendapat reply
  - Comment mendapat reply
  - Thread/comment mendapat upvote (opsional, bisa dimatikan di settings)
  - Thread di-pin atau di-close (untuk author)
- Notifikasi badge pada icon forum
- Email digest untuk notifikasi (daily/weekly, configurable)

#### FR-COMM-007: Thread Status & Activity
- Tampilkan metadata thread:
  - Author dengan avatar dan role badge (Mentor/Mentee/Manager)
  - Waktu posting (relative: "2 jam yang lalu")
  - Jumlah views
  - Jumlah replies
  - Last activity (siapa yang terakhir reply, kapan)
  - Linked class (jika ada)
- Badge: "New" (< 24 jam), "Hot" (banyak activity dalam 48 jam), "Trending", "Solved" (jika pertanyaan), "Pinned"
- Author reputation score (based on upvotes received)

#### FR-COMM-008: Mark as Solved (untuk Thread Pertanyaan)
- Author thread atau moderator dapat mark thread sebagai "Solved"
- Pilih reply mana yang menjadi solusi (tampilkan badge "✓ Solusi")
- Solved thread tampil berbeda (warna hijau atau badge)
- Filter untuk show only unsolved questions

#### FR-COMM-009: User Profiles & Reputation
- User profile menampilkan:
  - Total threads created
  - Total comments
  - Total upvotes received (reputation score)
  - Badges/achievements (e.g., "Top Contributor", "Helpful")
- Leaderboard: Top contributors (by reputation, monthly/all-time)

#### FR-COMM-010: Bookmarks & Following
- User dapat bookmark thread untuk dibaca nanti
- User dapat follow thread untuk mendapat notifikasi setiap ada reply baru
- User dapat follow user lain untuk melihat activity mereka

### Non-Functional Requirements
- Real-time update untuk new threads/replies (via WebSocket atau polling 10s)
- Support rich text dengan mention, bold, italic, list, link
- Image auto-compress sebelum upload
- Pagination: 20 threads per page, 50 comments per page

---

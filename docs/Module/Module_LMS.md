## Learning Management System (LMS) Module

### Konsep
- Course terdiri dari multiple topics
- Course dapat di-assign ke kelas tertentu (mandatory) atau dibuka untuk umum
- Mentor dan Manager dapat assign course ke kelas
- Tracking progress pembelajaran per user

### Functional Requirements

#### FR-LMS-001: CRUD Course (Manager)
- Manager dapat membuat course dengan:
  - Judul course
  - Deskripsi lengkap
  - Thumbnail/cover image
  - Level (pemula, menengah, lanjutan)
  - Estimasi durasi
  - Prerequisites (opsional)
  - Tipe course: Umum (semua bisa akses) atau Private (hanya kelas tertentu)
- Manager dapat mengubah dan menonaktifkan course
- Manager dapat duplicate course
- Manager dapat melihat statistik enrollment course

#### FR-LMS-002: CRUD Topic dalam Course (Manager)
- Manager dapat menambah topic dalam course:
  - Judul topic
  - Deskripsi
  - Urutan/sequence
  - Durasi estimasi
  - Tipe: Materi biasa atau Mandatory (harus diselesaikan untuk lanjut)
- Manager dapat reorder topic (drag and drop)
- Manager dapat menghapus topic (dengan warning jika ada progress user)

#### FR-LMS-003: CRUD Learning Material (Manager)
- Manager dapat menambah material ke dalam topic:
  - **Video:** Link YouTube (auto-embed dengan preview)
  - **Dokumen:** Upload file (PDF, PPT, DOC, XLS) - max 10MB per file
  - **Artikel:** Rich text editor dengan formatting
  - **Link eksternal:** URL ke resource luar
- Manager dapat menambah multiple material per topic
- Manager dapat mengatur urutan material
- Manager dapat set durasi estimasi per material

#### FR-LMS-004: CRUD Quiz (Manager)
- Manager dapat membuat quiz untuk topic:
  - Judul quiz
  - Deskripsi/instruksi
  - Passing score (%) - default 70%
  - Durasi pengerjaan (menit, opsional)
  - Jumlah percobaan maksimal (default: unlimited)
  - Tampilkan jawaban benar: Ya/Tidak
- Manager dapat menambah pertanyaan multiple choice:
  - Teks pertanyaan (support gambar)
  - 2-5 pilihan jawaban
  - Pilih jawaban benar (single/multiple)
  - Penjelasan jawaban (opsional)
  - Bobot poin (default: sama rata)
- Manager dapat import pertanyaan dari Excel
- Manager dapat edit dan hapus quiz

#### FR-LMS-005: Assign Course ke Kelas (Manager/Mentor)
- Manager atau Mentor dapat assign course ke kelas tertentu:
  - Pilih course dari catalog
  - Pilih kelas tujuan
  - Set sebagai Mandatory (wajib) atau Optional (opsional)
  - Set deadline completion (opsional)
  - Set urutan priority (jika ada multiple assigned courses)
- Sistem otomatis enroll semua mentee yang ada di kelas
- Sistem auto-enroll mentee baru yang join kelas
- Notifikasi ke mentee saat ada course baru di-assign
- Mentor/Manager dapat unassign course dari kelas

#### FR-LMS-006: Course Enrollment (Mentor/Mentee)
- User dapat browse catalog course umum yang tersedia
- Filter course: Level, kategori, durasi
- User dapat melihat detail course sebelum enroll:
  - Deskripsi lengkap
  - List topics
  - Jumlah material dan quiz
  - Rating dan jumlah peserta (opsional)
- User dapat enroll course umum dengan 1 klik
- User otomatis ter-enroll untuk course yang di-assign ke kelasnya
- Sistem mencatat tanggal enrollment
- User dapat melihat list "Course Saya":
  - Tab "Wajib" (assigned mandatory courses)
  - Tab "Opsional" (assigned optional + self-enrolled)
  - Progress bar per course
  - Deadline (jika ada)

#### FR-LMS-007: Consume Learning Material (Mentor/Mentee)
- User dapat mengakses material berdasarkan urutan topic
- **Video:** Embedded YouTube player
  - Track video progress
  - Speed control (0.5x - 2x)
  - Resume dari terakhir ditonton
- **Dokumen:** Preview dalam browser (Google Docs Viewer) atau download
- **Artikel:** Display dengan rich text formatting
- **Link eksternal:** Open in new tab
- Sistem mark material sebagai "selesai" dengan kriteria:
  - Video: ditonton minimal 80% durasi
  - Dokumen: dibuka dan preview selama minimal 30 detik
  - Artikel: scroll hingga akhir konten
  - Link: diklik (tanpa tracking eksternal)
- User dapat manual mark as complete
- Progress bar per topic dan overall course
- Navigation: Previous/Next material

#### FR-LMS-008: Quiz Attempt (Mentor/Mentee)
- User dapat mengerjakan quiz setelah menyelesaikan material
- Interface quiz:
  - Tampilkan instruksi dan aturan quiz
  - Option: tampilkan 1 pertanyaan per halaman atau semua sekaligus
  - Timer countdown (jika ada limit waktu)
  - Progress indicator: "Soal 3 dari 10"
  - Mark pertanyaan untuk review nanti
  - Draft auto-save (setiap 30 detik)
- Sistem auto-submit saat waktu habis
- Warning sebelum submit: "Anda yakin submit? Masih ada X soal belum dijawab"
- Tampilkan hasil setelah submit:
  - Skor total (angka dan persentase)
  - Status: Lulus (passed) / Tidak Lulus (failed)
  - Waktu yang dihabiskan
  - Review jawaban (jika diaktifkan):
    - Pertanyaan yang benar (hijau)
    - Pertanyaan yang salah (merah)
    - Jawaban benar vs jawaban user
    - Penjelasan
- History attempts: tampilkan semua percobaan dengan skor
- User dapat retry quiz (jika belum mencapai batas maksimal)
- Best score digunakan sebagai nilai akhir

#### FR-LMS-009: Progress Tracking (Mentor/Mentee)
- Dashboard "Course Saya" menampilkan:
  - List semua enrolled courses
  - Overall progress per course (%)
  - Status: Belum Dimulai / Sedang Berjalan / Selesai
  - Deadline (jika ada) dengan color indicator (hijau/kuning/merah)
  - Last accessed
- Detail progress per course:
  - Progress per topic (checklist)
  - Material yang sudah completed
  - Quiz scores (semua attempts)
  - Estimasi waktu tersisa
- Certificate digital otomatis generated saat:
  - Course 100% complete
  - Semua quiz lulus (jika ada)
  - Include: nama user, judul course, tanggal completion, nomor unik
- User dapat download certificate (PDF)

#### FR-LMS-010: Monitor Mentee Progress (Mentor)
- Mentor dapat melihat progress course semua mentee di kelasnya:
  - Dashboard overview:
    - List course yang di-assign ke kelas
    - Jumlah mentee yang enrolled
    - Rata-rata completion rate (%)
    - Mentee dengan progress terendah (at risk)
  - Detail per course:
    - Tabel mentee dengan kolom: Nama, Progress (%), Status, Last Activity, Quiz Scores
    - Sort by: nama, progress, last activity
    - Filter: status (belum mulai/berjalan/selesai), progress range
  - Detail per mentee:
    - Timeline activity
    - Topics yang sudah diselesaikan
    - Quiz attempts dan scores
    - Waktu yang dihabiskan di course
- Mentor dapat export report progress:
  - Format: Excel/CSV/PDF
  - Filter berdasarkan: course, mentee, date range
- Notifikasi ke mentor: mentee belum mulai course 7 hari setelah assigned

### Non-Functional Requirements
- Video tracking harus support YouTube IFrame API
- File upload maksimal 10MB per dokumen dengan progress bar
- Quiz harus support minimal 100 pertanyaan per topic
- Progress tracking real-time (via WebSocket) atau polling 5 detik
- Certificate PDF generation < 3 detik

---

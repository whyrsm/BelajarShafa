## 3.10 Registration Module

### Konsep
- Sistem memiliki dua tipe registrasi: **Mentee** dan **Mentor**
- Setiap registrasi memerlukan verifikasi email
- Mentor registration memerlukan approval dari Manager
- Setiap user memiliki profil yang dapat dilengkapi setelah registrasi

### Functional Requirements

#### FR-REG-001: Register as Mentee
- User dapat mendaftar sebagai mentee dengan informasi:
  - Email (required, unique)
  - Password (required, min 8 karakter, kombinasi huruf & angka)
  - Confirm Password (required, harus sama dengan password)
  - Nama Lengkap (required)
  - Jenis Kelamin (required: Laki-laki/Perempuan/Lainnya)
- Validasi form:
  - Email format valid dan belum terdaftar
  - Password strength indicator (weak/medium/strong)
- Sistem mengirim email verifikasi setelah registrasi
- User diarahkan ke halaman "Verify Email" dengan instruksi
- Account status: "Pending Verification" hingga email diverifikasi

#### FR-REG-002: Register as Mentor
- User dapat mendaftar sebagai mentor dengan informasi:
  - **Informasi Dasar:**
    - Email (required, unique)
    - Password (required, min 8 karakter, kombinasi huruf & angka)
    - Confirm Password (required)
    - Nama Lengkap (required)
    - Jenis Kelamin (required)
  - **Informasi Profesional:**
    - Pekerjaan/Profesi Saat Ini (required)
    - Nama Perusahaan/Organisasi (required)
    - Lama Pengalaman Profesional (required, dalam tahun)
    - LinkedIn Profile URL (optional)
  - **Informasi Mentoring:**
    - Bidang Keahlian (required, multi-select)
    - Motivasi Menjadi Mentor (required, min 50 karakter)
  - **Ketersediaan:**
    - Waktu yang Tersedia untuk Mentoring (required, checkbox: Weekday Morning/Afternoon/Evening, Weekend Morning/Afternoon/Evening)
    - Preferensi Mode Mentoring (required, multi-select: Online/Offline/Hybrid)
- Validasi form sama seperti mentee + tambahan:
  - Lama pengalaman minimal 1 tahun
  - Motivasi minimal 50 karakter
  - Minimal pilih 1 bidang keahlian
  - Minimal pilih 1 waktu ketersediaan
- Sistem mengirim email verifikasi setelah registrasi
- Setelah email diverifikasi, account status: "Pending Approval"
- Sistem mengirim notifikasi ke Manager untuk review aplikasi mentor
- Mentor tidak dapat login hingga di-approve oleh Manager

#### FR-REG-003: Email Verification
- Sistem generate unique verification token (expires dalam 24 jam)
- Email verifikasi berisi:
  - Link verifikasi dengan token
  - Nama user
  - Instruksi jelas
  - Link untuk resend verification email
  - Waktu expired token
- User klik link verifikasi:
  - Jika token valid dan belum expired: account terverifikasi, redirect ke login page dengan success message
  - Jika token expired: tampilkan error dengan opsi "Resend Verification Email"
  - Jika token invalid: tampilkan error message
- User dapat request resend verification email:
  - Input email address
  - Sistem validasi email terdaftar dan belum terverifikasi
  - Generate token baru dan kirim email
  - Tampilkan confirmation message

#### FR-REG-004: Mentor Application Review (Manager)
- Manager dapat melihat list semua mentor applications:
  - Filter: Pending/Approved/Rejected/All
  - Sort: Tanggal Apply (newest/oldest), Nama (A-Z/Z-A)
  - Search: by nama atau email
  - Badge indicator: "New" untuk aplikasi < 24 jam
- Manager dapat melihat detail aplikasi mentor:
  - Semua informasi yang disubmit mentor
  - Tanggal registrasi
  - Status email verification
  - File sertifikasi (jika ada)
- Manager dapat melakukan action:
  - **Approve**: 
    - Konfirmasi approval
    - Sistem ubah status menjadi "Active"
    - Sistem kirim email notifikasi ke mentor (approved + instruksi login)
    - Mentor dapat login dan akses sistem
  - **Reject**:
    - Manager harus input alasan penolakan (required, min 20 karakter)
    - Konfirmasi rejection
    - Sistem ubah status menjadi "Rejected"
    - Sistem kirim email notifikasi ke mentor dengan alasan penolakan
    - Mentor tidak dapat login
    - Opsi untuk mentor: re-apply setelah 30 hari
  - **Request More Info**:
    - Manager input pertanyaan/informasi yang dibutuhkan
    - Sistem kirim email ke mentor
    - Status tetap "Pending Approval"
    - Mentor dapat reply via email atau update aplikasi
- Manager dapat melihat history semua actions (audit trail)

#### FR-REG-006: Password Requirements & Security
- Password harus memenuhi kriteria:
  - Minimal 8 karakter
  - Kombinasi huruf besar dan kecil
  - Minimal 1 angka
  - Minimal 1 karakter spesial (!@#$%^&*)
- Password strength indicator real-time:
  - Weak (merah): < 8 karakter atau tidak memenuhi kriteria
  - Medium (kuning): 8-11 karakter, memenuhi 3 kriteria
  - Strong (hijau): ≥ 12 karakter, memenuhi semua kriteria
- Password disimpan dengan bcrypt hashing (salt rounds: 10)
- Sistem prevent common passwords (check against common password list)

#### FR-REG-007: Profile Completion Reminder
- Setelah registrasi berhasil dan email terverifikasi:
  - Jika profil belum lengkap (< 70% fields terisi): tampilkan banner reminder
  - Banner muncul di dashboard dengan CTA "Complete Your Profile"
  - Progress bar menunjukkan persentase kelengkapan profil
- Untuk Mentor yang sudah approved tapi profil belum lengkap:
  - Email reminder dikirim setiap 7 hari (maksimal 3 kali)
  - Banner tetap muncul di dashboard
- User dapat dismiss banner, tapi akan muncul lagi setelah 3 hari

#### FR-REG-008: Registration Analytics (Manager)
- Manager dapat melihat dashboard analytics:
  - Total registrations (Mentee vs Mentor) - per hari/minggu/bulan
  - Mentor application status breakdown (Pending/Approved/Rejected)
  - Average approval time untuk mentor applications
  - Registration source breakdown (Email/Google/LinkedIn)
  - Top bidang keahlian dari mentor applications
  - Grafik trend registrasi (line chart)
  - Conversion rate: registration → verified → active (untuk mentor)
- Export data registrasi ke Excel/CSV
- Filter berdasarkan tanggal range, role, status, source

#### FR-REG-009: Account Activation & Deactivation
- Manager dapat deactivate account (Mentee atau Mentor):
  - Input alasan deactivation (required)
  - Konfirmasi action
  - User tidak dapat login
  - Sistem kirim email notifikasi ke user
  - Data user tetap tersimpan (soft delete)
- Manager dapat reactivate account:
  - Konfirmasi action
  - User dapat login kembali
  - Sistem kirim email notifikasi
- User dapat self-deactivate account:
  - Input password untuk konfirmasi
  - Input alasan (optional)
  - Konfirmasi action
  - Account status: "Deactivated by User"
  - User dapat request reactivation via email ke support

#### FR-REG-010: Duplicate Account Prevention
- Sistem check duplicate berdasarkan:
  - Email (primary check)
- Jika email sudah terdaftar:
  - Tampilkan error: "Email already registered"
  - Berikan opsi: "Forgot Password?" atau "Login"

### Non-Functional Requirements
- Email verification token harus expired dalam 24 jam
- Password hashing menggunakan bcrypt dengan minimum 10 salt rounds
- Registration form harus responsive dan mobile-friendly
- Email delivery harus < 1 menit setelah action

### User Experience Guidelines
- Registration flow harus jelas dan tidak overwhelming:
  - Mentee: single page form atau maksimal 2 steps
  - Mentor: multi-step form (3-4 steps) dengan progress indicator
- Setiap field harus memiliki:
  - Label yang jelas
  - Placeholder text sebagai contoh
  - Helper text jika diperlukan
  - Error message yang spesifik dan actionable
- Success state harus jelas:
  - Confirmation message
  - Next steps yang jelas
  - CTA button untuk action selanjutnya
- Error state harus helpful:
  - Jelas apa yang salah
  - Bagaimana cara memperbaiki
  - Link ke support jika diperlukan

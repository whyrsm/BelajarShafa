## Profile Module

### Konsep
- Self-service profile management untuk semua users
- Informasi pribadi dan profesional dalam Bahasa Indonesia

### Functional Requirements

#### FR-PRF-001: CRUD Profile (Semua User)
- User dapat mengedit profil dengan informasi:
  - Nama lengkap (required, max 100 karakter)
  - Email (read-only, dari registrasi)
  - Foto profil (upload image, max 2MB, format JPG/PNG)
  - Nomor HP (format: +62xxx, validasi format Indonesia)
  - Instansi/Kampus (dropdown + custom input)
  - Profesi/Jabatan (text field, max 100 karakter)
  - Keahlian (Skills) (multiple tags/chips, max 15 tags)
  - Bio (textarea, max 500 karakter)
  - Link Sosial Media (LinkedIn, Instagram, Portfolio, GitHub)
  - Jenis Kelamin (dropdown)
  - Tanggal Lahir (date picker, opsional)
  - Kota Domisili (dropdown kota di Indonesia)
- Real-time character counter untuk field yang ada limit
- Preview profil sebelum save
- Validasi format

#### FR-PRF-002: Avatar & Photo Upload
- User dapat upload atau crop foto profil
- Cropping tool: square aspect ratio (1:1)
- Auto-compress image jika > 500KB
- Option: pilih dari avatar default (jika tidak upload foto)
- Preview langsung setelah upload

#### FR-PRF-003: Privacy Settings
- User dapat mengatur visibility profil:
  - Publik: Visible untuk semua user dalam platform
  - Organisasi Saja: Hanya visible untuk user dalam organisasi yang sama
  - Kelas Saja: Hanya visible untuk mentor/mentee di kelas yang sama
  - Privat: Hanya visible untuk diri sendiri
- User dapat pilih field mana yang ditampilkan:
  - Nomor HP, Instansi/Kampus, Social media links, Bio
- Settings dapat di-save secara granular

#### FR-PRF-004: View Profile (Semua User)
- User dapat melihat profil mentor/mentee dalam kelasnya
- Klik nama/avatar user → buka modal/page profil
- Display informasi sesuai privacy settings pemilik profil
- Tampilkan:
  - Foto profil, Nama, Role, Bio, Skills, Informasi kontak
  - Statistik (opsional untuk mentor): Jumlah kelas, mentee, rating

#### FR-PRF-005: Edit Password & Security
- User dapat ubah password:
  - Input: Password lama, Password baru, Konfirmasi
  - Validasi: minimal 8 karakter, kombinasi huruf & angka
- User dapat enable Two-Factor Authentication (2FA) - opsional
- User dapat melihat login history (device, location, time)

#### FR-PRF-006: Notification Preferences
- User dapat set preferensi notifikasi:
  - Email notifications (on/off per kategori)
  - In-app notifications (on/off per kategori)
  - Frequency: Real-time, Daily digest, Weekly digest

### Non-Functional Requirements
- Foto profil auto-compress ke max 500KB dengan quality 85%
- Support format image: JPG, PNG, WebP
- Profile update response time < 1 detik
- Privacy settings apply real-time

---

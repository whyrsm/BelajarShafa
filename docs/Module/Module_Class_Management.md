### Class Management Module

#### Konsep
- Setiap kelas dapat memiliki **multiple mentors** (co-mentoring)
- Setiap sesi pertemuan memiliki presensi kehadiran (self check-in + manual override)
- Setiap kelas memiliki forum diskusi internal
- Setiap kelas memiliki kode unik untuk invitation
- Satu mentor bisa memiliki multiple kelas
- Satu mentee bisa memiliki multiple kelas

### Functional Requirements

#### FR-CM-001: CRUD Kelas (Manager/Mentor)
- Manager/Mentor dapat membuat kelas baru dengan informasi:
  - Nama kelas
  - Deskripsi
  - **Mentors (multiple selection)** - minimal 1 mentor
  - Jadwal pertemuan (hari, waktu)
  - Durasi program (tanggal mulai - selesai)
  - Maksimal mentee (opsional)
  - Kategori kelas (opsional)
- Sistem generate kode unik untuk setiap kelas (alphanumeric, 6-8 karakter)
- Manager/Semua mentor dapat mengubah informasi kelas
- Manager/Mentor dapat menonaktifkan/mengarsipkan kelas
- Tampilkan daftar semua mentor dalam card/badge di detail kelas

#### FR-CM-002: Manajemen Mentor dalam Kelas (Manager)
- Manager dapat menambah/menghapus mentor dari kelas
- Manager dapat set "Lead Mentor" (primary) dan "Co-Mentor"
- Notifikasi ke mentor saat ditambahkan/dihapus dari kelas
- Semua mentor memiliki akses penuh ke kelas (equal permissions)

#### FR-CM-003: Invite Mentee (Mentor)
- Semua mentor dapat membagikan kode undangan kelas
- Semua mentor dapat melihat daftar mentee yang sudah bergabung
- Semua mentor dapat menghapus mentee dari kelas (dengan konfirmasi)
- Sistem mengirim notifikasi ke mentee saat berhasil bergabung

#### FR-CM-004: Join Kelas (Mentee)
- Mentee dapat memasukkan kode undangan untuk bergabung
- Sistem validasi kode dan status kelas (aktif/penuh)
- Mentee dapat melihat detail kelas termasuk list semua mentor
- Mentee dapat keluar dari kelas (dengan konfirmasi)

#### FR-CM-005: Manajemen Sesi Pertemuan (Mentor)
- Semua mentor dapat membuat sesi pertemuan dengan informasi:
  - Judul/topik sesi
  - Tanggal dan waktu
  - Durasi sesi
  - Lokasi/link meeting (online/offline)
  - Agenda/deskripsi
  - Mentor yang hadir (multi-select jika ada multiple mentors)
  - Status (scheduled, ongoing, completed, cancelled)
  - Batas waktu check-in (misal: 15 menit sebelum - 30 menit setelah mulai)
- Mentor dapat mengubah dan menghapus sesi
- Mentor dapat melihat list semua sesi (upcoming & past)
- Sistem otomatis mengurutkan sesi berdasarkan tanggal
- Sistem otomatis ubah status menjadi "ongoing" saat waktu dimulai

#### FR-CM-006: Catatan Sesi Pertemuan (Mentor)
- Semua mentor dapat menambahkan/edit catatan pada setiap sesi:
  - Materi yang dibahas
  - Key takeaways
  - Action items
  - File attachment (PDF, PPT, images - max 10MB)
  - Tag mentor yang menulis catatan
- Catatan dapat diedit setelah sesi selesai
- Catatan visible untuk semua mentee dan mentor di kelas
- Mentee dapat download attachment

#### FR-CM-007: Presensi Kehadiran - Self Check-in (Mentee)
- Mentee dapat melakukan self check-in untuk sesi yang sedang berlangsung:
  - Tampilkan tombol "Check-in" di sesi yang active
  - Check-in hanya bisa dilakukan dalam window waktu tertentu (misal: 15 menit sebelum hingga 30 menit setelah sesi dimulai)
  - Sistem otomatis catat waktu check-in
  - Konfirmasi setelah berhasil check-in
- Mentee dapat melihat status presensi realtime (sudah/belum check-in)
- Geolocation check-in (opsional): untuk pertemuan offline, validasi lokasi mentee

#### FR-CM-008: Presensi Kehadiran - Manual Override (Mentor)
- Mentor dapat mengisi/mengubah presensi manual:
  - Status: Hadir, Izin, Sakit, Alfa
  - Override self check-in (misal: mentee check-in tapi tidak benar-benar hadir)
  - Tambah catatan per mentee
- Mentor dapat export data presensi (Excel/CSV)
- Sistem hitung persentase kehadiran otomatis:
  - Per mentee
  - Per kelas (rata-rata)

#### FR-CM-009: Dashboard Kelas Saya (Mentor & Mentee)
- Mentor dan Mentee dapat melihat daftar semua kelas yang diikuti/diampu
- Informasi ringkas per kelas (Nama, Jadwal, Status)
- Fitur pencarian dan filter kelas
- Shortcut untuk masuk ke detail kelas

#### FR-CM-010: Catatan Perkembangan Mentee (Mentor)
- Semua mentor dapat membuat catatan private tentang perkembangan mentee:
  - Tanggal catatan
  - Kategori (performance, behavior, skill development, attitude, participation)
  - Isi catatan (rich text)
  - Rating/skor (1-5 bintang, opsional)
  - Tag mentor yang menulis
- Catatan ini hanya visible untuk mentor-mentor di kelas, TIDAK untuk mentee
- Semua mentor dapat melihat catatan yang dibuat mentor lain (collaborative)
- Mentor dapat edit catatan miliknya sendiri
- Filter catatan berdasarkan mentee, kategori, dan mentor

#### FR-CM-011: View History (Mentee)
- Mentee dapat melihat history presensi kehadiran:
  - List semua sesi dengan status kehadiran (Hadir/Izin/Sakit/Alfa)
  - Waktu check-in (jika ada)
  - Persentase kehadiran total
  - Grafik kehadiran per bulan
  - Filter berdasarkan bulan/periode
- Mentee dapat melihat history sesi pertemuan:
  - List semua sesi (past & upcoming)
  - Detail sesi: topik, waktu, lokasi, mentor yang hadir
  - Catatan sesi dari mentor
  - File attachment yang dibagikan

### Non-Functional Requirements
- Kode undangan kelas harus unik dan case-insensitive
- Self check-in harus responsive < 1 detik
- Support minimal 100 mentee per kelas
- Geolocation accuracy ± 50 meter (jika diaktifkan)

---

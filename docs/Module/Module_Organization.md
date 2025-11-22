## Organization Module

### Konsep
- Organization adalah container untuk multiple classes
- Dikelola oleh Manager
- Menyediakan view agregat dan statistik

### Functional Requirements

#### FR-ORG-001: CRUD Organization (Manager)
- Manager dapat membuat organisasi dengan:
  - Nama organisasi
  - Deskripsi
  - Logo (upload image, max 2MB)
  - Kontak: Email, Telepon, Alamat
  - Website (opsional)
- Manager dapat mengubah informasi organisasi
- Manager dapat menonaktifkan organisasi (soft delete)
- Satu Manager dapat memiliki multiple organisasi
- Manager dapat transfer ownership organisasi

#### FR-ORG-002: Manajemen Kelas dalam Organisasi (Manager)
- Manager dapat membuat kelas baru dalam organisasi:
  - Set informasi kelas
  - Assign multiple mentors ke kelas
- Manager dapat melihat list semua kelas dalam organisasi:
  - View: Card/List
  - Filter: Status (aktif/selesai/arsip), Mentor
  - Sort: Terbaru, Alfabetis, Jumlah mentee
- Manager dapat memindahkan kelas antar organisasi (jika memiliki multiple orgs)
- Manager dapat mengarsipkan kelas
- Manager dapat duplicate kelas (template)

#### FR-ORG-003: Dashboard & Statistik (Manager)
- Dashboard organisasi menampilkan KPI cards:
  - Jumlah kelas: Total, Aktif, Selesai, Arsip
  - Jumlah mentor unik di organisasi
  - Jumlah mentee total di semua kelas
  - Rata-rata kehadiran across all classes (%)
  - Course completion rate (jika ada assigned courses)
- Grafik & Charts:
  - Trend mentee growth (line chart per bulan)
  - Attendance rate per kelas (bar chart)
  - Top performing classes (berdasarkan kehadiran & completion)
  - Mentor workload (jumlah kelas & mentee per mentor)
- Filter data berdasarkan:
  - Periode waktu (minggu ini, bulan ini, 3 bulan, custom range)
  - Kelas tertentu
  - Mentor tertentu
- Export statistik:
  - Format: PDF (report format) / Excel (raw data)
  - Include: charts, tables, summary

#### FR-ORG-004: User Management dalam Organisasi (Manager)
- Manager dapat invite mentor ke organisasi via email
- Manager dapat melihat list semua users dalam organisasi:
  - Tab: Mentors, Mentees, All
  - Info: Nama, Email, Status, Kelas yang diikuti, Last active
- Manager dapat assign/unassign mentor dari kelas
- Manager dapat menonaktifkan user dalam organisasi (soft delete)
- Manager dapat set role: Manager, Mentor

#### FR-ORG-005: Settings & Preferences (Manager)
- Manager dapat set organizational settings:
  - Timezone default
  - Logo yang tampil di certificate
  - Email template untuk notifications
  - Mandatory courses untuk semua kelas baru
- Manager dapat set forum moderation rules

### Non-Functional Requirements
- Dashboard harus load dalam < 3 detik dengan lazy loading charts
- Statistik update setiap hari pada midnight atau on-demand refresh
- Support minimal 1000 mentee per organisasi
- Export report generation < 10 detik

---

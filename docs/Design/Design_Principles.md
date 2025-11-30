## 9. User Flows (Key Scenarios)



### 9.2 Mentor Journey: Manage Class & Monitor Progress

1. **Create class**
   - Dari dashboard, klik "Buat Kelas Baru"
   - Isi form: nama, deskripsi, jadwal
   - Sistem generate kode undangan otomatis
   - Bagikan kode ke calon mentee

2. **Invite co-mentor**
   - Dari class detail, klik "Tambah Mentor"
   - Input email mentor lain
   - Mentor lain terima notifikasi dan accept

3. **Create session**
   - Klik "Buat Sesi Baru"
   - Set tanggal, waktu, topik, lokasi/link
   - Set window check-in
   - Save → notifikasi otomatis ke semua mentee

4. **Conduct session & check attendance**
   - Saat sesi berlangsung, lihat realtime siapa yang sudah check-in
   - Setelah sesi, tambahkan catatan sesi
   - Manual override presensi jika ada yang lupa check-in

5. **Assign course**
   - Dari class detail, klik "Tugaskan Course"
   - Pilih course dari catalog
   - Set sebagai mandatory, set deadline
   - Save → semua mentee auto-enrolled

6. **Monitor mentee progress**
   - Akses tab "Progress Course"
   - Lihat tabel progress semua mentee
   - Filter mentee yang at risk (progress < 50%)
   - Export report untuk evaluasi

7. **Add mentee notes**
   - Klik profile mentee → "Tambah Catatan"
   - Tulis observasi private tentang perkembangan mentee
   - Save (hanya visible untuk mentor)

### 9.3 Manager Journey: Create Organization & View Analytics

1. **Create organization**
   - Dari dashboard, klik "Buat Organisasi"
   - Isi nama, deskripsi, upload logo
   - Save

2. **Invite mentors**
   - Dari org dashboard, klik "Undang Mentor"
   - Input email mentors (bisa multiple)
   - Mentors terima email invitation

3. **Create classes**
   - Dari org detail, klik "Buat Kelas"
   - Assign mentors ke kelas
   - Set informasi kelas

4. **Create & assign courses**
   - Klik "Kelola Course"
   - Buat course baru dengan topics & materials
   - Assign course ke multiple kelas sekaligus

5. **View analytics**
   - Akses dashboard organisasi
   - Lihat KPI: jumlah kelas, mentor, mentee
   - Lihat grafik trend dan performance
   - Export report untuk stakeholders

## 10. Design Principles & Device Strategy

### Core Principles

#### Visual Hierarchy & Depth
- **Elevation System:** Use soft shadows with multiple layers (shadow-sm at rest, shadow-md on hover).
- **Depth through Layering:** Subtle background patterns/gradients, distinct card sections, floating action buttons.
- **Strategic Borders:** Color-coded accent borders (e.g., blue-500 left border for active items) instead of just gray lines.

#### Typography & Spacing
- **Purposeful Spacing:** Reduce excessive whitespace, use 12-16px gaps instead of 24px+.
- **Font Hierarchy:** Semibold for titles, medium for labels, regular for body. Avoid uniform weights.
- **Color Variation:** Headings in gray-900, secondary info in gray-600.

#### Color & Interaction
- **Accent Colors:** Beyond blue - success green for 'Selesai', warning orange for deadlines, warm neutral grays.
- **Status Badges:** Background colors with matching text (e.g., 'Mendatang' in blue-50 with blue-700 text).
- **Interactive States:** Cards scale(1.01) on hover, buttons have active states, links have underline-offset.

#### Micro-details
- **Icons:** Consistent sizing and optical alignment.
- **Visual Separators:** Thin divider lines between sections (border-t border-gray-200).
- **Rounded Corners:** Consistent but varied - cards rounded-lg, buttons rounded-md, badges rounded-full.
- **Empty States:** Illustrations or subtle background patterns.

#### Avoid AI-generated look
- No overly rounded everything (not all rounded-2xl).
- No excessive gradients or glass morphism everywhere.
- Intentional asymmetry is human.
- Functional density for productivity.

### Device Usage Strategy

The design adapts to the specific needs of each user role based on their primary device usage:

#### 1. Mobile-First: Mentee & Mentor
* **Primary Device:** Mobile (Smartphone/Tablet).
* **Usage Context:** On-the-go access, quick check-ins, reading materials, communication.
* **Design Requirements:**
    - **Touch-Friendly:** Minimum touch target size of 44x44px.
    - **Vertical Layout:** Content stacks naturally; avoid horizontal scrolling for text.
    - **Simplified Navigation:** Bottom navigation bars or hamburger menus for easy thumb access.
    - **Performance:** Optimized for potentially unstable mobile networks.

#### 2. Desktop-Optimized: Manager
* **Primary Device:** Desktop/Laptop.
* **Usage Context:** Heavy administration, LMS management, statistical analysis, reporting.
* **Design Requirements:**
    - **Information Density:** Utilize screen real estate to display comprehensive data tables and dashboards.
    - **Advanced Controls:** Support for complex interactions like drag-and-drop (for course building) and multi-column layouts.
    - **Data Visualization:** Rich charts and graphs for statistics that require precise mouse interaction.
    - **Multitasking:** Persistent sidebars and breadcrumbs for deep navigation.
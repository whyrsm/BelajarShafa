# Navigation System

This directory contains the navigation components for the BelajarShafa application. The navigation system is designed with a mobile-first approach while providing optimal desktop experiences for different user roles.

## Components

### 1. **DashboardLayout**
The main layout wrapper that orchestrates all navigation components.

**Usage:**
```tsx
import { DashboardLayout } from '@/components/navigation';

export default function YourPage() {
  return (
    <DashboardLayout>
      {/* Your page content */}
    </DashboardLayout>
  );
}
```

**Features:**
- Automatic user authentication check
- Role-based navigation rendering
- Responsive layout management
- Loading states

---

### 2. **Sidebar** (Desktop Only)
A fixed sidebar navigation for desktop users (lg breakpoint and above).

**Features:**
- Role-based menu filtering
- Active state highlighting
- Smooth transitions
- Fixed positioning on large screens
- Hidden on mobile devices

**Navigation Items:**
- Dashboard
- Kelas (Classes)
- Course
- Sesi (Sessions) - *Mentor & Manager only*
- Presensi (Attendance)
- Organisasi (Organization) - *Manager only*
- Statistik (Analytics) - *Manager & Mentor only*
- Pengaturan (Settings)

---

### 3. **BottomNav** (Mobile Only)
A fixed bottom navigation bar for mobile users.

**Features:**
- Touch-friendly design (44x44px minimum touch targets)
- Role-based menu filtering
- Active state indicators
- Limited to 5 items for optimal mobile UX
- Safe area support for devices with notches

**Navigation Items (Mobile-Optimized):**
- Beranda (Home)
- Kelas (Classes)
- Course
- Sesi (Sessions) - *Mentor & Manager only*
- Presensi (Attendance) - *Mentee only*
- Profil (Profile)

---

### 4. **TopHeader**
A sticky top header with user profile, search, and notifications.

**Features:**
- User profile dropdown with role badge
- Search functionality (desktop & mobile)
- Notification bell with count indicator
- Logout functionality
- Responsive design

**Props:**
```typescript
interface TopHeaderProps {
  userName?: string;
  userEmail?: string;
  userRole?: string;
  onMenuClick?: () => void;
  notificationCount?: number;
}
```

---

## Design Principles

### Mobile-First Approach
- **Mentees & Mentors:** Primary mobile users
  - Bottom navigation for easy thumb access
  - Touch-friendly 44x44px minimum targets
  - Simplified navigation (max 5 items)
  - Vertical content layout

### Desktop-Optimized
- **Managers:** Primary desktop users
  - Persistent sidebar for quick navigation
  - Information-dense layouts
  - Advanced controls and multi-column views
  - Comprehensive navigation options

### Responsive Breakpoints
- **Mobile:** `< 1024px` - Bottom navigation visible
- **Desktop:** `≥ 1024px` - Sidebar visible

---

## Role-Based Navigation

The navigation system automatically filters menu items based on user roles:

### Manager
- Full access to all navigation items
- Organization management
- Analytics and statistics
- Class and course management

### Mentor
- Class management
- Session scheduling
- Attendance tracking
- Analytics (limited to their classes)

### Mentee
- Class participation
- Course enrollment
- Attendance check-in
- Profile management

---

## Styling & Theming

The navigation components use the application's design system:

- **Colors:** Primary blue (#02478C) for active states
- **Shadows:** Soft elevation for depth
- **Transitions:** Smooth 200ms transitions
- **Typography:** Inter font family
- **Spacing:** Consistent 12-16px gaps

### Active States
- **Sidebar:** Primary background with white text
- **Bottom Nav:** Primary color with scale animation
- **Hover:** Accent background on desktop

---

## Accessibility

- Semantic HTML elements
- Keyboard navigation support
- ARIA labels where appropriate
- Focus indicators
- Touch-friendly targets (mobile)

---

## Future Enhancements

- [ ] Breadcrumb navigation for deep pages
- [ ] Notification system integration
- [ ] Search functionality implementation
- [ ] Keyboard shortcuts
- [ ] Mobile gesture support (swipe navigation)
- [ ] Progressive Web App (PWA) support

---

## Files

```
components/navigation/
├── DashboardLayout.tsx  # Main layout wrapper
├── Sidebar.tsx          # Desktop sidebar
├── BottomNav.tsx        # Mobile bottom navigation
├── TopHeader.tsx        # Top header with user menu
├── index.ts             # Exports
└── README.md            # This file
```

---

## Dependencies

- `next/navigation` - Routing
- `lucide-react` - Icons
- `@radix-ui/react-dropdown-menu` - Dropdown menu
- `@/components/ui/*` - UI components (Button, Badge, etc.)
- `@/lib/api/auth` - User authentication

---

## Notes

- The navigation system automatically handles authentication
- Users without a valid token are redirected to `/login`
- The layout includes proper padding for mobile bottom navigation
- Safe area insets are handled for devices with notches

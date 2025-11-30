# BelajarShafa Frontend Architecture & Patterns

## Project Overview
- **Framework**: Next.js 16 (App Router, Server & Client Components)
- **Language**: TypeScript 5
- **UI Library**: React 19.2.0 with Radix UI components
- **Form Handling**: React Hook Form 7.66.1
- **Validation**: Zod 4.1.12
- **Styling**: TailwindCSS 4 + Tailwind Merge
- **Icons**: Lucide React
- **State Management**: Local React State (useState, useContext)
- **HTTP Client**: Native Fetch API
- **Architecture**: Monorepo with workspaces (client + server)

---

## 1. Form Implementation Patterns

### Pattern 1: React Hook Form with Zod Validation
**Used in**: Login, Register, Create Class pages

**Key Features**:
- Combines `react-hook-form` with `@hookform/resolvers/zod` for schema validation
- Schema defined as Zod object at page/component level
- Clean separation of validation logic from UI

**Example Structure** (from login/page.tsx):
```typescript
const loginSchema = z.object({
    email: z.string().email('validation message'),
    password: z.string().min(1, 'validation message'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

const { register, handleSubmit, formState: { errors } } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
});
```

**Benefits**:
- Type-safe form values
- Automatic error messages from schema
- Reduced boilerplate validation code

---

### Pattern 2: Headless Form Component (SessionForm)
**Used in**: Session creation and editing (via modals)

**Key Features**:
- Uses custom Form component from `@/components/ui/form`
- FormField/FormControl/FormMessage architecture (similar to shadcn)
- Conditional field rendering based on form state (`form.watch()`)
- Error handling and loading states
- Dynamic imports for API calls

**Example from SessionForm.tsx**:
- `useForm()` with default values
- `form.watch('type')` to conditionally show location or meeting URL fields
- `onCancel` callback for modal integration
- `hideHeader` prop for modal vs. standalone use

**State Pattern**:
```typescript
const [loading, setLoading] = useState(false);
const [error, setError] = useState('');
const form = useForm<CreateSessionData & { type: SessionType }>({
    defaultValues: session ? { ...sessionFields } : { ...defaultFields }
});
```

---

### Pattern 3: Manual Form Implementation (CreateClassPage)
**Used in**: Class creation with complex mentor selection

**Key Features**:
- `register` + `handleSubmit` from react-hook-form
- Manual state management for multi-select (`selectedMentorIds`)
- `setValue` from form to sync manual state with form
- Custom UI for selection (not using Select component)
- Avatar handling with fallback initials

**Key Insight**: Form validation happens at schema level, but selection UI is separate state

---

## 2. Component Structure & Organization

### Directory Structure
```
client/src/
├── app/                          # Next.js App Router pages
│   ├── login/
│   ├── register/
│   ├── dashboard/
│   ├── classes/
│   │   ├── create/
│   │   ├── join/
│   │   └── [id]/                 # Dynamic route
│   └── layout.tsx
├── components/                   # Reusable components
│   ├── ui/                       # Primitive UI components (button, card, input, etc.)
│   ├── classes/                  # Domain-specific (ClassCard, MemberList)
│   ├── sessions/                 # Session management (SessionList, SessionCard, SessionForm)
│   ├── attendance/               # Attendance tracking
│   └── ...
└── lib/
    ├── api/                      # API client functions
    │   ├── auth.ts
    │   ├── classes.ts
    │   ├── sessions.ts
    │   ├── users.ts
    │   └── attendance.ts
    └── utils.ts                  # Utility functions (cn() for class merging)
```

### Component Patterns

**1. UI Components** (`/components/ui/`)
- Primitive components (Button, Card, Input, Label, Dialog, Form, Select, Badge)
- Wrapped Radix UI primitives with Tailwind styling
- Headless UI approach - only styling and structure, no logic
- Export various subcomponents (CardHeader, CardContent, DialogHeader, etc.)

**2. Domain Components** (SessionCard, MemberList, ClassCard)
- Specialized for specific features
- Include business logic and API calls
- Can be composed into pages or larger components
- Handle local state for modals, deletion, etc.

**3. Container/Page Components** (`/app/*/page.tsx`)
- 'use client' directive
- Complex state management
- Load and manage data
- Role-based rendering
- Orchestrate modals and tabs

---

## 3. State Management Patterns

### Pattern 1: Local Component State
**Used for**: Forms, UI toggles, loading states, errors

```typescript
const [loading, setLoading] = useState(false);
const [error, setError] = useState('');
const [showSessionForm, setShowSessionForm] = useState(false);
```

### Pattern 2: Form State (React Hook Form)
**Used for**: Form data, validation, touched fields, errors

```typescript
const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { ... }
});
const { register, handleSubmit, watch, setValue } = form;
```

### Pattern 3: Collection/List State
**Used for**: Managing arrays of data (attendance records, selected mentors)

```typescript
const [selectedMentorIds, setSelectedMentorIds] = useState<string[]>([]);
const [attendanceRecords, setAttendanceRecords] = useState<
    Record<string, { status: AttendanceStatus; notes?: string }>
>({});
```

### Pattern 4: Data Fetching State
**Used for**: Loading remote data on mount

```typescript
useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) {
        router.push('/login');
        return;
    }
    loadData();
}, [classId, router]);
```

**Key Insight**: No global state management (Redux, Zustand, etc.) - all state is local to components. Data is fetched and passed down via props.

---

## 4. API Integration Patterns

### Pattern: Wrapper Functions with fetchWithAuth
**Location**: `/client/src/lib/api/*.ts`

**Core Pattern**:
```typescript
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

async function fetchWithAuth(url: string, options: RequestInit = {}): Promise<Response> {
    const token = localStorage.getItem('access_token');
    
    const headers = {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
    };

    const response = await fetch(`${API_URL}/api${url}`, {
        ...options,
        headers,
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'An error occurred' }));
        throw new Error(error.message || `HTTP error! status: ${response.status}`);
    }

    return response;
}
```

**Features**:
- Centralized token management
- Automatic Bearer token injection
- Base URL configuration from env
- Error handling with JSON parsing fallback
- Consistent error throwing

### Exported API Functions

**classes.ts**:
- `createClass(data)` - POST
- `getClasses()` - GET
- `getClassById(id)` - GET
- `updateClass(id, data)` - PATCH
- `deleteClass(id)` - DELETE
- `joinClass(code)` - POST
- `leaveClass(id)` - DELETE
- `assignMentors(classId, mentorIds)` - POST
- `removeMentee(classId, menteeId)` - DELETE

**sessions.ts**:
- `createSession(classId, data)` - POST
- `getSessions(classId)` - GET
- `getSessionById(id)` - GET
- `updateSession(id, data)` - PATCH
- `deleteSession(id)` - DELETE

**attendance.ts**:
- `checkIn(sessionId)` - POST
- `bulkMarkAttendance(sessionId, records)` - POST
- `updateAttendance(id, data)` - PATCH
- `getClassAttendanceHistory(classId)` - GET

**users.ts**:
- `getMentors()` - GET

**auth.ts**:
- `getProfile()` - GET

### Type Definitions
- Interfaces defined at API module level (e.g., `Session`, `Class`, `Attendance`)
- Separate interfaces for Create/Update operations (e.g., `CreateSessionData`, `UpdateSessionData`)
- Enum-like type unions for status values (e.g., `SessionType = 'ONLINE' | 'OFFLINE'`)

---

## 5. Routing Structure

### App Router Structure
- `/` - Home/splash page (redirects to login or dashboard)
- `/login` - Login form
- `/register` - Registration form
- `/dashboard` - Main dashboard with class list
- `/classes/create` - Create new class
- `/classes/join` - Join class with code
- `/classes/[id]` - Class detail page with tabs:
  - Sessions tab
  - Members tab (mentors + mentees)
  - Attendance tab

### Client-Side Navigation
- Uses Next.js `useRouter` from `'next/navigation'`
- `router.push()` for programmatic navigation
- Conditional routing based on auth token
- Role-based navigation (MENTOR, MENTEE, MANAGER paths differ)

### Authentication Flow
```typescript
useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) {
        router.push('/login');
        return;
    }
    loadData();
}, [router]);
```

---

## 6. UI Component Patterns

### Modal Pattern (Dialog)
**Components Using**: SessionCard, ClassDetail page

**Pattern**:
```typescript
const [editOpen, setEditOpen] = useState(false);

<Dialog open={editOpen} onOpenChange={setEditOpen}>
    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
            <DialogTitle>Edit Sesi</DialogTitle>
            <DialogDescription>Ubah detail sesi mentoring</DialogDescription>
        </DialogHeader>
        <SessionForm
            classId={session.classId}
            session={session}
            onSuccess={() => {
                setEditOpen(false);
                onUpdate?.();
            }}
            onCancel={() => setEditOpen(false)}
            hideHeader={true}
        />
    </DialogContent>
</Dialog>
```

**Key Features**:
- Forms have `hideHeader` prop when used in modals
- `onSuccess` callback closes modal and refetches data
- `onCancel` closes modal
- Responsive max-width and overflow handling

### Card Pattern
**Used for**: Content containers, class cards, session cards

**Subcomponents**:
- `Card` - Container
- `CardHeader` - Header section
- `CardTitle` - Large title
- `CardDescription` - Subtitle
- `CardContent` - Main content area
- `CardFooter` - Footer section

### Tab Pattern
**Location**: ClassDetailPage

**Implementation**:
```typescript
const [activeTab, setActiveTab] = useState<TabType>('sessions');

const tabs = [
    { id: 'sessions' as TabType, label: 'Sesi', icon: Calendar },
    { id: 'members' as TabType, label: 'Anggota', icon: Users },
    { id: 'attendance' as TabType, label: 'Kehadiran', icon: ClipboardList },
];

// Custom tab rendering with icons
{tabs.map(tab => {
    const Icon = tab.icon;
    return (
        <button
            onClick={() => setActiveTab(tab.id)}
            className={activeTab === tab.id ? 'border-primary text-primary' : '...'}
        >
            <Icon className="w-4 h-4" />
            {tab.label}
        </button>
    );
})}

// Conditional rendering
{activeTab === 'sessions' && <SessionList {...} />}
{activeTab === 'members' && <MemberList {...} />}
```

### Table Pattern
**Location**: AttendanceMarker component

**Features**:
- Custom table using `<table>` element
- Header row with column names
- Body rows with form controls (Select, Input)
- Color-coded status indicators
- Responsive scroll wrapper

### Badge Pattern
**Used for**: Status indicators, session type, session status

```typescript
<Badge variant={isUpcoming ? 'default' : isPast ? 'secondary' : 'outline'}>
    {isUpcoming ? 'Mendatang' : isPast ? 'Selesai' : 'Berlangsung'}
</Badge>
<Badge variant="outline">{session.type}</Badge>
```

---

## 7. Key Reusable Patterns for LMS

### Pattern 1: CRUD Modal Pattern
- Button that opens modal
- Modal contains form component with `hideHeader={true}`
- Form has `onSuccess` that closes modal and refetches
- Form has `onCancel` that closes modal

### Pattern 2: Data Loading Pattern
```typescript
const [data, setData] = useState(null);
const [loading, setLoading] = useState(true);
const [error, setError] = useState('');

useEffect(() => {
    loadData();
}, [dependency]);

const loadData = async () => {
    try {
        setLoading(true);
        const result = await apiFunction();
        setData(result);
    } catch (err) {
        setError(err.message);
    } finally {
        setLoading(false);
    }
};
```

### Pattern 3: Role-Based Rendering
```typescript
const isMentor = user && classData?.mentors.some(m => m.id === user.userId);
const isMentee = user && classData?.mentees.some(m => m.id === user.userId);
const isManager = user?.role === 'MANAGER';
const canEdit = isManager || isMentor;

{canEdit && <Button>Edit</Button>}
{canCreateSession && <SessionForm />}
```

### Pattern 4: Confirmation Dialog Pattern
```typescript
const handleDelete = async () => {
    if (!confirm('Are you sure?')) {
        return;
    }
    
    setDeleting(true);
    try {
        await deleteAPI();
        router.push('/');
    } catch (err) {
        setError(err.message);
    } finally {
        setDeleting(false);
    }
};
```

### Pattern 5: Conditional Field Pattern
```typescript
const sessionType = form.watch('type');

{sessionType === 'OFFLINE' && (
    <FormField name="location" ... />
)}

{sessionType === 'ONLINE' && (
    <FormField name="meetingUrl" ... />
)}
```

---

## 8. TypeScript Patterns

### Inferred Types from Zod
```typescript
const schema = z.object({ ... });
type FormValues = z.infer<typeof schema>;
```

### API Response Types
```typescript
interface Class {
    id: string;
    name: string;
    code: string;
    mentors: Array<{ id: string; name: string; email: string }>;
    mentees: Array<{ id: string; name: string; email: string }>;
    // ... other fields
}

interface CreateClassData {
    name: string;
    description?: string;
    mentorIds: string[];
}
```

### Union Types for Status
```typescript
type SessionType = 'ONLINE' | 'OFFLINE';
type AttendanceStatus = 'PRESENT' | 'ABSENT' | 'PERMIT' | 'SICK';
```

---

## 9. Error Handling Patterns

### API Error Handling
```typescript
if (!response.ok) {
    let errorMessage = `HTTP error! status: ${response.status}`;
    try {
        const error = await response.json();
        errorMessage = error.message || errorMessage;
    } catch {
        errorMessage = response.statusText || errorMessage;
    }
    throw new Error(errorMessage);
}
```

### Component Error Display
```typescript
{error && (
    <div className="p-3 rounded-md bg-destructive/10 text-destructive text-sm">
        {error}
    </div>
)}
```

### Form-Level Errors
```typescript
{errors.name && (
    <p className="text-sm text-destructive">{errors.name.message}</p>
)}
```

---

## 10. Styling Approach

### Tailwind CSS Classes
- Utility-first approach
- Responsive classes: `md:`, `lg:`, `sm:`
- State modifiers: `hover:`, `focus:`, `disabled:`, `data-[state=open]:`
- Semantic colors: `primary`, `destructive`, `muted-foreground`

### cn() Utility Function
- Combines clsx and tailwind-merge
- Merges Tailwind classes without conflicts
- Used throughout components

### Color Status Mapping
```typescript
const statusConfig = {
    PRESENT: { label: 'Hadir', bgColor: 'bg-green-100', textColor: 'text-green-800' },
    ABSENT: { label: 'Tidak Hadir', bgColor: 'bg-red-100', textColor: 'text-red-800' },
    PERMIT: { label: 'Izin', bgColor: 'bg-yellow-100', textColor: 'text-yellow-800' },
    SICK: { label: 'Sakit', bgColor: 'bg-blue-100', textColor: 'text-blue-800' },
};
```

---

## 11. Performance Optimizations

### Code Splitting
- Dynamic imports for large modules
```typescript
const { deleteSession } = await import('@/lib/api/sessions');
```

### Data Fetching
- Parallel data fetching with `Promise.all()`
```typescript
const [classData, userData] = await Promise.all([
    getClassById(classId),
    getProfile(),
]);
```

### Conditional Data Loading
- Only load attendance data when needed (when tab is active)
```typescript
useEffect(() => {
    if (activeTab === 'attendance' && classData) {
        loadAttendance();
    }
}, [activeTab, classId, classData]);
```

---

## Summary of Patterns for LMS

1. **Forms**: Use React Hook Form + Zod for validation + custom UI components or SessionForm pattern
2. **Modals**: Dialog component with embedded form, `hideHeader` and callbacks
3. **Lists**: Use card components with actions (Edit/Delete buttons opening modals)
4. **Tables**: Attendance marker pattern with inline selects and inputs
5. **Data Loading**: useEffect + useState + error handling pattern
6. **Role-Based UI**: Conditional rendering based on user role and relationships
7. **Validation**: Zod schemas at form level with detailed error messages
8. **API Calls**: Centralized API modules with typed functions
9. **Navigation**: Next.js useRouter with token-based auth
10. **Styling**: Tailwind CSS with semantic colors and cn() utility

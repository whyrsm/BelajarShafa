import { fetchWithAuth } from './utils';

export type AttendanceStatus = 'PRESENT' | 'ABSENT' | 'PERMIT' | 'SICK';

export interface Attendance {
    id: string;
    sessionId: string;
    userId: string;
    status: AttendanceStatus;
    checkInTime?: string;
    notes?: string;
    markedBy?: string;
    createdAt: string;
    updatedAt: string;
    session?: {
        id: string;
        title: string;
        startTime: string;
    };
    user?: {
        id: string;
        name: string;
        email: string;
        avatarUrl?: string;
    };
    marker?: {
        id: string;
        name: string;
    };
}

export interface AttendanceRecord {
    menteeId: string;
    status: AttendanceStatus;
    notes?: string;
}

export interface BulkAttendanceData {
    records: AttendanceRecord[];
}

export interface UpdateAttendanceData {
    status?: AttendanceStatus;
    notes?: string;
}

export interface AttendanceHistoryItem {
    session: {
        id: string;
        title: string;
        startTime: string;
        endTime?: string;
    };
    attendance: Attendance | null;
}

export interface AttendanceStatistics {
    present: number;
    absent: number;
    permit: number;
    sick: number;
    noRecord: number;
    attendanceRate: number;
}

export interface MenteeAttendanceHistory {
    menteeId: string;
    totalSessions: number;
    statistics: AttendanceStatistics;
    history: AttendanceHistoryItem[];
}

export interface ClassAttendanceHistory {
    classId: string;
    totalSessions: number;
    mentees: Array<{
        mentee: {
            id: string;
            name: string;
            email: string;
            avatarUrl?: string;
        };
        totalSessions: number;
        statistics: AttendanceStatistics;
        history: AttendanceHistoryItem[];
    }>;
}

export async function checkIn(sessionId: string): Promise<Attendance> {
    const response = await fetchWithAuth(`/sessions/${sessionId}/check-in`, {
        method: 'POST',
    });
    return response.json();
}

export async function bulkMarkAttendance(
    sessionId: string,
    data: BulkAttendanceData,
): Promise<Attendance[]> {
    const response = await fetchWithAuth(`/sessions/${sessionId}/attendance`, {
        method: 'POST',
        body: JSON.stringify(data),
    });
    return response.json();
}

export async function updateAttendance(
    id: string,
    data: UpdateAttendanceData,
): Promise<Attendance> {
    const response = await fetchWithAuth(`/attendance/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
    });
    return response.json();
}

export async function getClassAttendanceHistory(
    classId: string,
): Promise<MenteeAttendanceHistory | ClassAttendanceHistory> {
    const response = await fetchWithAuth(`/classes/${classId}/attendance`);
    return response.json();
}


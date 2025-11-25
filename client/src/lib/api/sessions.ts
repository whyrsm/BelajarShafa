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

export type SessionType = 'ONLINE' | 'OFFLINE';

export interface Session {
    id: string;
    title: string;
    description?: string;
    startTime: string;
    endTime?: string;
    type: SessionType;
    location?: string;
    meetingUrl?: string;
    checkInWindowMinutes: number;
    checkInCloseMinutes: number;
    classId: string;
    createdBy: string;
    createdAt: string;
    updatedAt: string;
    class?: {
        id: string;
        name: string;
    };
    creator?: {
        id: string;
        name: string;
        email: string;
    };
    attendances?: Array<{
        id: string;
        userId: string;
        status: 'PRESENT' | 'ABSENT' | 'PERMIT' | 'SICK';
        checkInTime?: string;
        notes?: string;
        user: {
            id: string;
            name: string;
            email: string;
            avatarUrl?: string;
        };
    }>;
}

export interface CreateSessionData {
    title: string;
    description?: string;
    startTime: string;
    endTime?: string;
    type: SessionType;
    location?: string;
    meetingUrl?: string;
    checkInWindowMinutes?: number;
}

export interface UpdateSessionData {
    title?: string;
    description?: string;
    startTime?: string;
    endTime?: string;
    type?: SessionType;
    location?: string;
    meetingUrl?: string;
    checkInWindowMinutes?: number;
}

export async function createSession(classId: string, data: CreateSessionData): Promise<Session> {
    const response = await fetchWithAuth(`/classes/${classId}/sessions`, {
        method: 'POST',
        body: JSON.stringify(data),
    });
    return response.json();
}

export async function getSessions(classId: string): Promise<Session[]> {
    const response = await fetchWithAuth(`/classes/${classId}/sessions`);
    return response.json();
}

export async function getSessionById(id: string): Promise<Session> {
    const response = await fetchWithAuth(`/sessions/${id}`);
    return response.json();
}

export async function updateSession(id: string, data: UpdateSessionData): Promise<Session> {
    const response = await fetchWithAuth(`/sessions/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
    });
    return response.json();
}

export async function deleteSession(id: string): Promise<void> {
    await fetchWithAuth(`/sessions/${id}`, {
        method: 'DELETE',
    });
}


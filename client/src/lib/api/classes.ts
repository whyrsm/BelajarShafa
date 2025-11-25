const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

interface ApiResponse<T> {
    data?: T;
    error?: string;
}

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
        let errorMessage = `HTTP error! status: ${response.status}`;
        try {
            const error = await response.json();
            errorMessage = error.message || errorMessage;
        } catch {
            // If response is not JSON, use status text
            errorMessage = response.statusText || errorMessage;
        }
        
        // Log error for debugging
        console.error(`API Error [${response.status}]: ${url}`, {
            status: response.status,
            statusText: response.statusText,
            message: errorMessage,
        });
        
        throw new Error(errorMessage);
    }

    return response;
}

export interface Class {
    id: string;
    name: string;
    description?: string;
    code: string;
    organizationId?: string;
    startDate?: string;
    endDate?: string;
    createdAt: string;
    updatedAt: string;
    mentors: Array<{
        id: string;
        name: string;
        email: string;
        avatarUrl?: string;
    }>;
    mentees: Array<{
        id: string;
        name: string;
        email: string;
        avatarUrl?: string;
    }>;
    organization?: {
        id: string;
        name: string;
    };
}

export interface CreateClassData {
    name: string;
    description?: string;
    startDate?: string;
    endDate?: string;
    mentorIds: string[];
    organizationId?: string;
}

export interface UpdateClassData {
    name?: string;
    description?: string;
    startDate?: string;
    endDate?: string;
}

export interface JoinClassData {
    code: string;
}

export interface AssignMentorsData {
    mentorIds: string[];
}

export async function createClass(data: CreateClassData): Promise<Class> {
    const response = await fetchWithAuth('/classes', {
        method: 'POST',
        body: JSON.stringify(data),
    });
    return response.json();
}

export async function getClasses(): Promise<Class[]> {
    const response = await fetchWithAuth('/classes');
    return response.json();
}

export async function getClassById(id: string): Promise<Class> {
    const response = await fetchWithAuth(`/classes/${id}`);
    return response.json();
}

export async function updateClass(id: string, data: UpdateClassData): Promise<Class> {
    const response = await fetchWithAuth(`/classes/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
    });
    return response.json();
}

export async function deleteClass(id: string): Promise<void> {
    await fetchWithAuth(`/classes/${id}`, {
        method: 'DELETE',
    });
}

export async function joinClass(data: JoinClassData): Promise<Class> {
    const response = await fetchWithAuth('/classes/join', {
        method: 'POST',
        body: JSON.stringify(data),
    });
    return response.json();
}

export async function leaveClass(id: string): Promise<void> {
    await fetchWithAuth(`/classes/${id}/leave`, {
        method: 'DELETE',
    });
}

export async function assignMentors(classId: string, data: AssignMentorsData): Promise<Class> {
    const response = await fetchWithAuth(`/classes/${classId}/mentors`, {
        method: 'POST',
        body: JSON.stringify(data),
    });
    return response.json();
}

export async function removeMentee(classId: string, menteeId: string): Promise<Class> {
    const response = await fetchWithAuth(`/classes/${classId}/mentees/${menteeId}`, {
        method: 'DELETE',
    });
    return response.json();
}


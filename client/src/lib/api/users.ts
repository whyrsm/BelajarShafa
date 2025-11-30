import { getApiUrl } from '@/lib/utils';

const API_URL = getApiUrl();

async function fetchWithAuth(url: string, options: RequestInit = {}): Promise<Response> {
    const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
    
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

export interface Mentor {
    id: string;
    name: string;
    email: string;
    avatarUrl?: string;
}

export async function getMentors(): Promise<Mentor[]> {
    const response = await fetchWithAuth('/users/mentors');
    
    // Check if response has content
    const text = await response.text();
    if (!text) {
        return [];
    }
    
    try {
        return JSON.parse(text);
    } catch (error) {
        console.error('Failed to parse mentors response:', error);
        return [];
    }
}


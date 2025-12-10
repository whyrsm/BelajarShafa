import { getApiUrl } from '@/lib/utils';
import { fetchWithAuth } from './utils';

const API_URL = getApiUrl();

export interface UserProfile {
    userId: string;
    email: string;
    name?: string;
    role: string;
}

export async function login(email: string, password: string) {
    const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'An error occurred' }));
        throw new Error(error.message || `HTTP error! status: ${response.status}`);
    }

    return response.json();
}

export async function register(data: Record<string, unknown>) {
    const response = await fetch(`${API_URL}/api/auth/register`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'An error occurred' }));
        throw new Error(error.message || `HTTP error! status: ${response.status}`);
    }

    return response.json();
}

export async function getProfile(): Promise<UserProfile> {
    const response = await fetchWithAuth('/auth/profile');
    return response.json();
}


import { fetchWithAuth } from './utils';

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


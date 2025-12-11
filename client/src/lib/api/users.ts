import { fetchWithAuth } from './utils';

export type UserRole = 'ADMIN' | 'MANAGER' | 'MENTOR' | 'MENTEE';

export interface Mentor {
    id: string;
    name: string;
    email: string;
    avatarUrl?: string;
    roles?: UserRole[];
}

export interface User {
    id: string;
    name: string;
    email: string;
    roles: UserRole[];
    gender?: 'MALE' | 'FEMALE' | 'OTHER';
    avatarUrl?: string;
    isActive: boolean;
    isVerified: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface UserDetails extends User {
    joinedClasses?: Array<{
        id: string;
        name: string;
        code: string;
        organization?: {
            id: string;
            name: string;
        };
    }>;
    mentoredClasses?: Array<{
        id: string;
        name: string;
        code: string;
        organization?: {
            id: string;
            name: string;
        };
    }>;
    managedOrgs?: Array<{
        id: string;
        name: string;
        description?: string;
        logoUrl?: string;
    }>;
    memberOrgs?: Array<{
        id: string;
        name: string;
        description?: string;
        logoUrl?: string;
    }>;
    enrollments?: Array<{
        id: string;
        enrolledAt: string;
        progressPercent: number;
        course: {
            id: string;
            title: string;
            thumbnailUrl?: string;
        };
    }>;
    mentorProfile?: any;
    menteeProfile?: any;
}

export interface UserStats {
    total: number;
    active: number;
    inactive: number;
    byRole: {
        mentors: number;
        managers: number;
        mentees: number;
    };
}

export interface UserFilterParams {
    search?: string;
    roles?: UserRole[];
    organizationId?: string;
    classId?: string;
    isActive?: boolean;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}

export interface PaginatedUsers {
    data: User[];
    meta: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
}

export interface CreateUserData {
    email: string;
    password: string;
    name: string;
    roles: UserRole[];
    gender?: 'MALE' | 'FEMALE' | 'OTHER';
}

export interface UpdateUserData {
    name?: string;
    email?: string;
    password?: string;
    roles?: UserRole[];
    gender?: 'MALE' | 'FEMALE' | 'OTHER';
    isActive?: boolean;
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

export async function getAllUsers(filters?: UserFilterParams): Promise<PaginatedUsers> {
    const params = new URLSearchParams();
    
    if (filters) {
        if (filters.search) params.append('search', filters.search);
        if (filters.roles && filters.roles.length > 0) {
            filters.roles.forEach(role => params.append('roles', role));
        }
        if (filters.organizationId) params.append('organizationId', filters.organizationId);
        if (filters.classId) params.append('classId', filters.classId);
        if (filters.isActive !== undefined) params.append('isActive', String(filters.isActive));
        if (filters.page) params.append('page', String(filters.page));
        if (filters.limit) params.append('limit', String(filters.limit));
        if (filters.sortBy) params.append('sortBy', filters.sortBy);
        if (filters.sortOrder) params.append('sortOrder', filters.sortOrder);
    }
    
    const queryString = params.toString();
    const url = `/users/filtered${queryString ? `?${queryString}` : ''}`;
    
    const response = await fetchWithAuth(url);
    return response.json();
}

export async function getUserStats(): Promise<UserStats> {
    const response = await fetchWithAuth('/users/stats');
    return response.json();
}

export async function createUser(data: CreateUserData): Promise<User> {
    const response = await fetchWithAuth('/users', {
        method: 'POST',
        body: JSON.stringify(data),
    });
    return response.json();
}

export async function updateUser(id: string, data: UpdateUserData): Promise<User> {
    const response = await fetchWithAuth(`/users/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
    });
    return response.json();
}

export async function updateUserRoles(id: string, roles: UserRole[]): Promise<User> {
    const response = await fetchWithAuth(`/users/${id}/roles`, {
        method: 'PATCH',
        body: JSON.stringify({ roles }),
    });
    return response.json();
}

export async function toggleUserActive(id: string): Promise<User> {
    const response = await fetchWithAuth(`/users/${id}/toggle-active`, {
        method: 'PATCH',
    });
    return response.json();
}

export async function getUserDetails(id: string): Promise<UserDetails> {
    const response = await fetchWithAuth(`/users/${id}/details`);
    return response.json();
}

export async function getUser(id: string): Promise<User> {
    const response = await fetchWithAuth(`/users/${id}`);
    return response.json();
}


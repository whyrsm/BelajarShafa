import { getApiUrl } from '@/lib/utils';

const API_URL = getApiUrl();

/**
 * Centralized fetch function with authentication that handles 401 errors
 * by redirecting to the login page
 */
export async function fetchWithAuth(url: string, options: RequestInit = {}): Promise<Response> {
    const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
    
    // Don't set Content-Type for FormData - browser will set it with boundary
    const isFormData = options.body instanceof FormData;
    
    const headers: HeadersInit = {
        ...(!isFormData && { 'Content-Type': 'application/json' }),
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
    };

    const response = await fetch(`${API_URL}/api${url}`, {
        ...options,
        headers,
    });

    if (!response.ok) {
        // Handle 401 Unauthorized - redirect to login
        if (response.status === 401) {
            // Clear token from localStorage
            if (typeof window !== 'undefined') {
                localStorage.removeItem('access_token');
                // Redirect to login page
                window.location.href = '/login';
            }
            
            // Throw error to prevent further execution
            throw new Error('Unauthorized. Please login again.');
        }

        // Handle other errors
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



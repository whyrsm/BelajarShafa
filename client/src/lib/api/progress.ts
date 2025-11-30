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
    let errorMessage = `HTTP error! status: ${response.status}`;
    try {
      const error = await response.json();
      errorMessage = error.message || errorMessage;
    } catch {
      errorMessage = response.statusText || errorMessage;
    }
    throw new Error(errorMessage);
  }

  return response;
}

export interface MaterialProgress {
  id: string;
  enrollmentId: string;
  materialId: string;
  watchedDuration: number; // in seconds
  isCompleted: boolean;
  lastAccessedAt: string;
}

export interface TopicProgress {
  topicId: string;
  materials: Array<{
    materialId: string;
    watchedDuration: number;
    isCompleted: boolean;
    lastAccessedAt: string | null;
  }>;
  completedCount: number;
  totalCount: number;
  progressPercent: number;
}

export interface UpdateProgressData {
  watchedDuration?: number; // in seconds
  isCompleted?: boolean;
}

export async function updateMaterialProgress(
  materialId: string,
  data: UpdateProgressData
): Promise<MaterialProgress> {
  const response = await fetchWithAuth(`/progress/material/${materialId}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
  return response.json();
}

export async function getMaterialProgress(materialId: string): Promise<MaterialProgress | null> {
  try {
    const response = await fetchWithAuth(`/progress/material/${materialId}`);
    return response.json();
  } catch (error) {
    // If no progress exists, return null
    return null;
  }
}

export async function markMaterialComplete(materialId: string): Promise<MaterialProgress> {
  const response = await fetchWithAuth(`/progress/material/${materialId}/complete`, {
    method: 'POST',
  });
  return response.json();
}

export async function getTopicProgress(topicId: string): Promise<TopicProgress> {
  const response = await fetchWithAuth(`/progress/topic/${topicId}`);
  return response.json();
}


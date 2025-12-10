import { fetchWithAuth } from './utils';

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


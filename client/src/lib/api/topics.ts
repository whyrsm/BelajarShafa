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

export interface Topic {
  id: string;
  courseId: string;
  title: string;
  description?: string;
  sequence: number;
  estimatedDuration?: number;
  isMandatory: boolean;
  createdAt: string;
  updatedAt: string;
  materials?: Array<{
    id: string;
    topicId: string;
    type: string;
    title: string;
    content: any;
    sequence: number;
    estimatedDuration?: number;
  }>;
  _count?: {
    materials: number;
  };
  course?: {
    id: string;
    title: string;
  };
}

export interface CreateTopicData {
  courseId: string;
  title: string;
  description?: string;
  sequence?: number;
  estimatedDuration?: number;
  isMandatory?: boolean;
}

export interface UpdateTopicData {
  title?: string;
  description?: string;
  sequence?: number;
  estimatedDuration?: number;
  isMandatory?: boolean;
}

export interface TopicReorderItem {
  id: string;
  sequence: number;
}

export interface ReorderTopicsData {
  topics: TopicReorderItem[];
}

export async function createTopic(data: CreateTopicData): Promise<Topic> {
  const response = await fetchWithAuth('/topics', {
    method: 'POST',
    body: JSON.stringify(data),
  });
  return response.json();
}

export async function getTopicsByCourse(courseId: string): Promise<Topic[]> {
  const response = await fetchWithAuth(`/topics/course/${courseId}`);
  return response.json();
}

export async function getTopicById(id: string): Promise<Topic> {
  const response = await fetchWithAuth(`/topics/${id}`);
  return response.json();
}

export async function updateTopic(id: string, data: UpdateTopicData): Promise<Topic> {
  const response = await fetchWithAuth(`/topics/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
  return response.json();
}

export async function deleteTopic(id: string): Promise<void> {
  await fetchWithAuth(`/topics/${id}`, {
    method: 'DELETE',
  });
}

export async function reorderTopics(courseId: string, data: ReorderTopicsData): Promise<Topic[]> {
  const response = await fetchWithAuth(`/topics/reorder/${courseId}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
  return response.json();
}

export async function duplicateTopic(id: string): Promise<Topic> {
  const response = await fetchWithAuth(`/topics/${id}/duplicate`, {
    method: 'POST',
  });
  return response.json();
}


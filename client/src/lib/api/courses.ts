import { fetchWithAuth } from './utils';
import { MaterialType, Material } from './materials';

export enum CourseLevel {
  BEGINNER = 'BEGINNER',
  INTERMEDIATE = 'INTERMEDIATE',
  ADVANCED = 'ADVANCED',
}

export enum CourseType {
  PUBLIC = 'PUBLIC',
  PRIVATE = 'PRIVATE',
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
  materials?: Material[];
  _count?: {
    materials: number;
  };
}

// Re-export Material type for convenience
export type { Material };

export interface Course {
  id: string;
  title: string;
  description?: string;
  thumbnailUrl?: string;
  level: CourseLevel;
  estimatedDuration?: number;
  prerequisites?: string;
  type: CourseType;
  isActive: boolean;
  categoryId: string;
  createdById: string;
  createdAt: string;
  updatedAt: string;
  category: {
    id: string;
    name: string;
    slug: string;
  };
  creator: {
    id: string;
    name: string;
    email: string;
  };
  topics?: Topic[];
  _count?: {
    topics: number;
  };
}

export interface CreateCourseData {
  title: string;
  description?: string;
  thumbnailUrl?: string;
  level: CourseLevel;
  estimatedDuration?: number;
  prerequisites?: string;
  type: CourseType;
  categoryId: string;
}

export interface UpdateCourseData {
  title?: string;
  description?: string;
  thumbnailUrl?: string;
  level?: CourseLevel;
  estimatedDuration?: number;
  prerequisites?: string;
  type?: CourseType;
  categoryId?: string;
  isActive?: boolean;
}

export interface CourseFilters {
  categoryId?: string;
  level?: CourseLevel;
  type?: CourseType;
}

export interface CourseStats {
  courseId: string;
  totalTopics: number;
  totalMaterials: number;
  totalEnrollments: number;
  completionRate: number;
}

export async function createCourse(data: CreateCourseData): Promise<Course> {
  const response = await fetchWithAuth('/courses', {
    method: 'POST',
    body: JSON.stringify(data),
  });
  return response.json();
}

export async function getCourses(filters?: CourseFilters): Promise<Course[]> {
  const params = new URLSearchParams();
  if (filters?.categoryId) params.append('categoryId', filters.categoryId);
  if (filters?.level) params.append('level', filters.level);
  if (filters?.type) params.append('type', filters.type);
  
  const queryString = params.toString();
  const url = queryString ? `/courses?${queryString}` : '/courses';
  
  const response = await fetchWithAuth(url);
  return response.json();
}

export async function getCourseById(id: string): Promise<Course> {
  const response = await fetchWithAuth(`/courses/${id}`);
  return response.json();
}

export async function updateCourse(id: string, data: UpdateCourseData): Promise<Course> {
  const response = await fetchWithAuth(`/courses/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
  return response.json();
}

export async function deleteCourse(id: string): Promise<void> {
  await fetchWithAuth(`/courses/${id}`, {
    method: 'DELETE',
  });
}

export async function duplicateCourse(id: string): Promise<Course> {
  const response = await fetchWithAuth(`/courses/${id}/duplicate`, {
    method: 'POST',
  });
  return response.json();
}

export async function getCourseStats(id: string): Promise<CourseStats> {
  const response = await fetchWithAuth(`/courses/${id}/stats`);
  return response.json();
}


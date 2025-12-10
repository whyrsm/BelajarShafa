import { CourseLevel, CourseType, Topic } from './courses';
import { fetchWithAuth } from './utils';

export interface Enrollment {
  id: string;
  userId: string;
  courseId: string;
  enrolledAt: string;
  completedAt?: string;
  progressPercent: number;
  lastAccessedAt?: string;
  course: {
    id: string;
    title: string;
    description?: string;
    thumbnailUrl?: string;
    level: CourseLevel;
    estimatedDuration?: number;
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
  };
}

export interface EnrollCourseData {
  courseId: string;
}

export async function enrollCourse(courseId: string): Promise<Enrollment> {
  const response = await fetchWithAuth('/enrollments', {
    method: 'POST',
    body: JSON.stringify({ courseId }),
  });
  return response.json();
}

export async function getMyEnrollments(): Promise<Enrollment[]> {
  const response = await fetchWithAuth('/enrollments/my-courses');
  return response.json();
}

export async function getCourseEnrollment(courseId: string): Promise<Enrollment | null> {
  try {
    const response = await fetchWithAuth(`/enrollments/course/${courseId}`);
    return response.json();
  } catch (error) {
    // If 404 or not enrolled, return null
    if (error instanceof Error && error.message.includes('404')) {
      return null;
    }
    throw error;
  }
}

export async function unenrollCourse(courseId: string): Promise<void> {
  await fetchWithAuth(`/enrollments/course/${courseId}`, {
    method: 'DELETE',
  });
}

export async function markCourseCompleted(courseId: string): Promise<Enrollment> {
  const response = await fetchWithAuth(`/enrollments/course/${courseId}/complete`, {
    method: 'POST',
  });
  return response.json();
}


const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

async function fetchWithAuth(url: string, options: RequestInit = {}): Promise<Response> {
  const token = localStorage.getItem('access_token');
  
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
    level: string;
    estimatedDuration?: number;
    type: string;
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
    topics?: Array<{
      id: string;
      title: string;
      sequence: number;
      _count?: {
        materials: number;
      };
    }>;
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


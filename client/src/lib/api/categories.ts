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

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  _count?: {
    courses: number;
  };
}

export interface CreateCategoryData {
  name: string;
  description?: string;
}

export interface UpdateCategoryData {
  name?: string;
  description?: string;
}

export async function createCategory(data: CreateCategoryData): Promise<Category> {
  const response = await fetchWithAuth('/categories', {
    method: 'POST',
    body: JSON.stringify(data),
  });
  return response.json();
}

export async function getCategories(): Promise<Category[]> {
  const response = await fetchWithAuth('/categories');
  return response.json();
}

export async function getCategoryById(id: string): Promise<Category> {
  const response = await fetchWithAuth(`/categories/${id}`);
  return response.json();
}

export async function updateCategory(id: string, data: UpdateCategoryData): Promise<Category> {
  const response = await fetchWithAuth(`/categories/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
  return response.json();
}

export async function deleteCategory(id: string): Promise<void> {
  await fetchWithAuth(`/categories/${id}`, {
    method: 'DELETE',
  });
}


import { fetchWithAuth } from './utils';

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


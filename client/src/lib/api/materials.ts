import { fetchWithAuth } from './utils';

export enum MaterialType {
  VIDEO = 'VIDEO',
  DOCUMENT = 'DOCUMENT',
  ARTICLE = 'ARTICLE',
  EXTERNAL_LINK = 'EXTERNAL_LINK',
}

export interface Material {
  id: string;
  topicId: string;
  type: MaterialType;
  title: string;
  content: {
    videoUrl?: string;
    documentUrl?: string;
    fileName?: string;
    fileSize?: number;
    articleContent?: string;
    externalUrl?: string;
  };
  sequence: number;
  estimatedDuration?: number;
  createdAt: string;
  updatedAt: string;
  topic?: {
    id: string;
    title: string;
    course: {
      id: string;
      title: string;
    };
  };
}

export interface CreateMaterialData {
  topicId: string;
  type: MaterialType;
  title: string;
  sequence?: number;
  estimatedDuration?: number;
  content: {
    videoUrl?: string;
    documentUrl?: string;
    fileName?: string;
    fileSize?: number;
    articleContent?: string;
    externalUrl?: string;
  };
}

export interface UpdateMaterialData {
  type?: MaterialType;
  title?: string;
  sequence?: number;
  estimatedDuration?: number;
  content?: {
    videoUrl?: string;
    documentUrl?: string;
    fileName?: string;
    fileSize?: number;
    articleContent?: string;
    externalUrl?: string;
  };
}

export interface MaterialReorderItem {
  id: string;
  sequence: number;
}

export interface ReorderMaterialsData {
  materials: MaterialReorderItem[];
}

export async function createMaterial(data: CreateMaterialData): Promise<Material> {
  const response = await fetchWithAuth('/materials', {
    method: 'POST',
    body: JSON.stringify(data),
  });
  return response.json();
}

export async function getMaterialsByTopic(topicId: string): Promise<Material[]> {
  const response = await fetchWithAuth(`/materials/topic/${topicId}`);
  return response.json();
}

export async function getMaterialById(id: string): Promise<Material> {
  const response = await fetchWithAuth(`/materials/${id}`);
  return response.json();
}

export async function updateMaterial(id: string, data: UpdateMaterialData): Promise<Material> {
  const response = await fetchWithAuth(`/materials/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
  return response.json();
}

export async function deleteMaterial(id: string): Promise<void> {
  await fetchWithAuth(`/materials/${id}`, {
    method: 'DELETE',
  });
}

export async function reorderMaterials(topicId: string, data: ReorderMaterialsData): Promise<Material[]> {
  const response = await fetchWithAuth(`/materials/reorder/${topicId}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
  return response.json();
}


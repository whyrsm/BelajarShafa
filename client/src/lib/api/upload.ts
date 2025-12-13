import { fetchWithAuth } from './utils';

export interface UploadDocumentResponse {
  success: boolean;
  data: {
    documentUrl: string;
    fileName: string;
    fileSize: number;
  };
}

export interface UploadImageResponse {
  success: boolean;
  data: {
    imageUrl: string;
    fileName: string;
    fileSize: number;
    key: string;
  };
}

export async function uploadDocument(file: File): Promise<UploadDocumentResponse> {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetchWithAuth('/upload/document', {
    method: 'POST',
    body: formData,
  });

  return response.json();
}

export async function uploadImage(file: File): Promise<UploadImageResponse> {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetchWithAuth('/upload/image', {
    method: 'POST',
    body: formData,
  });

  return response.json();
}

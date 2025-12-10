import { fetchWithAuth } from './utils';

export interface UploadDocumentResponse {
  success: boolean;
  data: {
    documentUrl: string;
    fileName: string;
    fileSize: number;
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

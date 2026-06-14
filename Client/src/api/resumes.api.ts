import client from './client';
import type { ApiResponse } from '../types';

export const resumesApi = {
  upload: (file: File) => {
    const formData = new FormData();
    formData.append('resume', file);
    return client.post<ApiResponse<unknown>>('/resumes/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  process: (file: File) => {
    const formData = new FormData();
    formData.append('resume', file);
    return client.post<ApiResponse<unknown>>('/resumes/process', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};

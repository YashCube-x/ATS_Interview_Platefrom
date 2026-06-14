import client from './client';
import type { ApiResponse, Interview } from '../types';

export const interviewsApi = {
  list: (params?: Record<string, string>) =>
    client.get<ApiResponse<Interview[]>>('/interviews', { params }),

  getById: (id: string) =>
    client.get<ApiResponse<Interview>>(`/interviews/${id}`),

  create: (data: Partial<Interview>) =>
    client.post<ApiResponse<Interview>>('/interviews', data),

  delete: (id: string) =>
    client.delete<ApiResponse<void>>(`/interviews/${id}`),
};

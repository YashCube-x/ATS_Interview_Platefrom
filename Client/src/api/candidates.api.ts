import client from './client';
import type { ApiResponse, Candidate } from '../types';

interface PaginatedResponse<T> {
  items: T[];
  pagination: { total: number; page: number; limit: number };
}

export const candidatesApi = {
  list: (params?: Record<string, string>) =>
    client.get<ApiResponse<PaginatedResponse<Candidate>>>('/candidates', { params })
      .then(res => ({
        ...res,
        data: { ...res.data, data: res.data.data.items },
      })),

  getById: (id: string) =>
    client.get<ApiResponse<Candidate>>(`/candidates/${id}`),

  create: (data: Partial<Candidate>) =>
    client.post<ApiResponse<Candidate>>('/candidates', data),

  update: (id: string, data: Partial<Candidate>) =>
    client.put<ApiResponse<Candidate>>(`/candidates/${id}`, data),

  delete: (id: string) =>
    client.delete<ApiResponse<object>>(`/candidates/${id}`),

  updateStatus: (id: string, status: string, rejectionReason?: string) =>
    client.patch<ApiResponse<Candidate>>(`/candidates/${id}/status`, { status, rejectionReason }),
};

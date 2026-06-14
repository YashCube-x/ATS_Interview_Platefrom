import client from './client';
import type { ApiResponse, Job, JobFormData } from '../types';

interface PaginatedResponse<T> {
  items: T[];
  pagination: { total: number; page: number; limit: number };
}

export const jobsApi = {
  list: (params?: Record<string, string>) =>
    client.get<ApiResponse<PaginatedResponse<Job>>>('/jobs', { params })
      .then(res => ({
        ...res,
        data: { ...res.data, data: res.data.data.items },
      })),

  getById: (id: string) =>
    client.get<ApiResponse<Job>>(`/jobs/${id}`),

  create: (data: JobFormData) =>
    client.post<ApiResponse<Job>>('/jobs', data),

  update: (id: string, data: Partial<JobFormData>) =>
    client.put<ApiResponse<Job>>(`/jobs/${id}`, data),

  delete: (id: string) =>
    client.delete<ApiResponse<object>>(`/jobs/${id}`),
};

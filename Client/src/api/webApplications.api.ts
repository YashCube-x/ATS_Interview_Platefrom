import client from './client';
import type { ApiResponse } from '../types';

export type WebAppStatus = 'new' | 'reviewed' | 'converted' | 'rejected';

export interface WebApplication {
  _id: string;
  fullName: string;
  email: string;
  phone?: string;
  positionApplied: string;
  coverLetter?: string;
  resumeUrl?: string;
  resumeOriginalName?: string;
  status: WebAppStatus;
  ipAddress?: string;
  referrerUrl?: string;
  convertedCandidateId?: string | { name: string; email: string; status: string };
  convertedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface WebApplicationSummary {
  total: number;
  new: number;
  reviewed: number;
  converted: number;
  rejected: number;
}

interface WebAppListResponse {
  applications: WebApplication[];
  total: number;
  page: number;
  limit: number;
}

export const webApplicationsApi = {
  list: (params?: { status?: WebAppStatus; page?: number; limit?: number }) =>
    client.get<ApiResponse<WebAppListResponse>>('/web-applications', { params }),

  getById: (id: string) =>
    client.get<ApiResponse<WebApplication>>(`/web-applications/${id}`),

  updateStatus: (id: string, status: WebAppStatus) =>
    client.patch<ApiResponse<WebApplication>>(`/web-applications/${id}/status`, { status }),

  getSummary: () =>
    client.get<ApiResponse<WebApplicationSummary>>('/web-applications/summary'),
};

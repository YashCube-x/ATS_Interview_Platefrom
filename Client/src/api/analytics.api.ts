import client from './client';
import type { ApiResponse, DashboardMetrics, JobAnalytics, CandidateAnalytics } from '../types';

export const analyticsApi = {
  getDashboard: () =>
    client.get<ApiResponse<DashboardMetrics>>('/analytics/dashboard'),

  getJobAnalytics: () =>
    client.get<ApiResponse<JobAnalytics>>('/analytics/jobs'),

  getCandidateAnalytics: () =>
    client.get<ApiResponse<CandidateAnalytics>>('/analytics/candidates'),
};

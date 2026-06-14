import client from './client';
import type { ApiResponse } from '../types';

export const portalApi = {
  login: (email: string, password: string) =>
    client.post<ApiResponse<{ token: string }>>('/portal/login', { email, password }),

  getProfile: () =>
    client.get<ApiResponse<unknown>>('/portal/profile'),

  getStatus: () =>
    client.get<ApiResponse<unknown>>('/portal/status'),
};

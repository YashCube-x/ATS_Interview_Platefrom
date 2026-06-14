import client from './client';
import type { ApiResponse, LoginPayload, RegisterPayload, LoginResponse, User } from '../types';

export const authApi = {
  login: (payload: LoginPayload) =>
    client.post<ApiResponse<LoginResponse>>('/auth/login', payload),

  register: (payload: RegisterPayload) =>
    client.post<ApiResponse<User>>('/auth/register', payload),

  refreshToken: (refreshToken: string) =>
    client.post<ApiResponse<{ accessToken: string }>>('/auth/refresh-token', { refreshToken }),

  getProfile: () =>
    client.get<ApiResponse<User>>('/auth/profile'),

  changePassword: (oldPassword: string, newPassword: string) =>
    client.post<ApiResponse<object>>('/auth/change-password', { oldPassword, newPassword }),
};

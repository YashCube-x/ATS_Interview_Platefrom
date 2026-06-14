import client from './client';
import type { ApiResponse } from '../types';

export const emailsApi = {
  send: (data: { to: string; subject: string; body: string; candidateId?: string }) =>
    client.post<ApiResponse<object>>('/emails/send', data),

  ingestResumes: () =>
    client.post<ApiResponse<any[]>>('/emails/ingest-resumes'),
};

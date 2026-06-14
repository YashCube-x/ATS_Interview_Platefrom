import client from './client';
import type { ApiResponse, MatchingResult } from '../types';

export const matchingApi = {
  runMatching: (jobId: string) =>
    client.post<ApiResponse<MatchingResult[]>>(`/matching/job/${jobId}`),

  getResults: (jobId: string) =>
    client.get<ApiResponse<MatchingResult[]>>(`/matching/job/${jobId}/results`),
};

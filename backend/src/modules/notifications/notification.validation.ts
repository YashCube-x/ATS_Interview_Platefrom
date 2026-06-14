import { z } from 'zod';
import { CandidateStatus } from '@common/enums';

export const candidateStatusNotificationSchema = z.object({
  candidate: z.object({
    name: z.string().min(1),
    email: z.string().email(),
  }),
  status: z.nativeEnum(CandidateStatus),
  jobTitle: z.string().optional(),
});

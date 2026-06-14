import { z } from 'zod';
import { InterviewRound, InterviewStatus } from '@common/enums';

export const createInterviewSchema = z.object({
  candidateId: z.string().min(1),
  jobId: z.string().min(1),
  round: z.nativeEnum(InterviewRound),
  scheduledDate: z.coerce.date(),
  duration: z.number().int().positive().optional(),
  interviewerName: z.string().optional(),
  interviewerEmail: z.string().email().optional(),
  location: z.string().optional(),
  meetingLink: z.string().optional(),
  notes: z.string().optional(),
});

export const updateInterviewSchema = createInterviewSchema.partial().extend({
  status: z.nativeEnum(InterviewStatus).optional(),
  feedback: z.string().optional(),
  rating: z.number().min(1).max(5).optional(),
  rescheduleReason: z.string().optional(),
});

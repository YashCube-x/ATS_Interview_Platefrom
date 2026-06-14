import { z } from 'zod';
import { JobStatus } from '@common/enums';

export const createJobSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  requiredSkills: z.array(z.string()).default([]),
  preferredSkills: z.array(z.string()).default([]),
  minimumExperience: z.number().min(0).default(0),
  educationRequirement: z.enum(['high_school', 'bachelors', 'masters', 'phd']).default('bachelors'),
  projectRequirement: z.string().optional(),
  salary: z.object({
    min: z.number().optional(),
    max: z.number().optional(),
    currency: z.string().default('USD'),
  }).optional(),
  location: z.string().optional(),
  jobType: z.enum(['full_time', 'part_time', 'contract', 'intern']).default('full_time'),
  status: z.nativeEnum(JobStatus).optional(),
});

export const updateJobSchema = createJobSchema.partial();

export const updateJobStatusSchema = z.object({ status: z.nativeEnum(JobStatus) });

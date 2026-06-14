import { z } from 'zod';
import { CandidateStatus, ResumeSource } from '@common/enums';

const companySchema = z.object({
  companyName: z.string().optional(),
  role: z.string().optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  duration: z.string().optional(),
});

const educationSchema = z.object({
  collegeName: z.string().optional(),
  course: z.string().optional(),
  passingYear: z.number().int().optional(),
  cgpa: z.number().optional(),
});

export const createCandidateSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  phone: z.string().optional(),
  location: z.string().optional(),
  experience: z.object({ totalYears: z.number().min(0).default(0) }).optional(),
  companies: z.array(companySchema).optional(),
  education: educationSchema.optional(),
  skills: z.array(z.string()).default([]),
  resumeUrl: z.string().min(1),
  resumeText: z.string().min(1),
  aiSummary: z.string().optional(),
  pineconeId: z.string().optional(),
  status: z.nativeEnum(CandidateStatus).optional(),
  source: z.nativeEnum(ResumeSource).optional(),
  currentJobTitle: z.string().optional(),
  currentCompany: z.string().optional(),
  linkedinUrl: z.string().optional(),
  portfolioUrl: z.string().optional(),
  notes: z.string().optional(),
});

export const updateCandidateSchema = createCandidateSchema.partial();

export const updateCandidateStatusSchema = z.object({
  status: z.nativeEnum(CandidateStatus),
  reason: z.string().optional(),
});

export const ratingSchema = z.object({
  technicalSkills: z.number().min(0).max(5).optional(),
  communication: z.number().min(0).max(5).optional(),
  cultureFit: z.number().min(0).max(5).optional(),
  overall: z.number().min(0).max(5).optional(),
});

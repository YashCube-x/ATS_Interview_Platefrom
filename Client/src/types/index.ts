/* ────────────────────────────────────────────
   Type definitions mirroring the backend models
   ──────────────────────────────────────────── */

// ── Enums ──────────────────────────────────

export type UserRole = 'admin' | 'recruiter' | 'candidate';

export type CandidateStatus =
  | 'applied'
  | 'reviewed'
  | 'shortlisted'
  | 'rejected'
  | 'selected'
  | 'offer_extended'
  | 'offer_accepted'
  | 'offer_declined'
  | 'onboarding'
  | 'joined';

export type JobStatus = 'draft' | 'open' | 'closed' | 'filled' | 'on_hold';

export type ResumeSource = 'email' | 'manual';

export type InterviewStatus = 'scheduled' | 'completed' | 'cancelled' | 'rescheduled';

export type InterviewRound = 'phone_screening' | 'technical' | 'hr' | 'final';

export type JobType = 'full_time' | 'part_time' | 'contract' | 'intern';

export type EducationLevel = 'high_school' | 'bachelors' | 'masters' | 'phd';

// ── API Response wrapper ───────────────────

export interface ApiResponse<T = unknown> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
  details?: string[];
}

// ── Auth ────────────────────────────────────

export interface User {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  avatar?: string;
  isActive: boolean;
  emailVerified: boolean;
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  role?: UserRole;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface LoginResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

// ── Candidate ──────────────────────────────

export interface Company {
  companyName: string;
  role: string;
  startDate: string;
  endDate?: string;
  duration?: string;
}

export interface Education {
  collegeName: string;
  course: string;
  passingYear: number;
  cgpa?: number;
}

export interface CandidateRatings {
  technicalSkills?: number;
  communication?: number;
  cultureFit?: number;
  overall?: number;
}

export interface Candidate {
  _id: string;
  name: string;
  email: string;
  phone: string;
  location: string;
  experience: { totalYears: number };
  companies: Company[];
  education: Education;
  skills: string[];
  resumeUrl: string;
  resumeText: string;
  aiSummary: string;
  pineconeId: string;
  status: CandidateStatus;
  source: ResumeSource;
  selectedAt?: string;
  rejectedAt?: string;
  rejectionReason?: string;
  currentJobTitle?: string;
  currentCompany?: string;
  linkedinUrl?: string;
  portfolioUrl?: string;
  notes?: string;
  ratings?: CandidateRatings;
  createdAt: string;
  updatedAt: string;
}

// ── Job ────────────────────────────────────

export interface Job {
  _id: string;
  title: string;
  description: string;
  requiredSkills: string[];
  preferredSkills: string[];
  minimumExperience: number;
  educationRequirement: EducationLevel;
  projectRequirement?: string;
  salary?: { min: number; max: number; currency: string };
  location: string;
  jobType: JobType;
  status: JobStatus;
  createdBy: string;
  closedAt?: string;
  publicDescription?: string;
  matchingSummary?: string;
  createdAt: string;
  updatedAt: string;
}

export interface JobFormData {
  title: string;
  description: string;
  requiredSkills: string[];
  preferredSkills: string[];
  minimumExperience: number;
  educationRequirement: EducationLevel;
  projectRequirement?: string;
  salary?: { min: number; max: number; currency: string };
  location: string;
  jobType: JobType;
}

// ── Interview ──────────────────────────────

export interface Interview {
  _id: string;
  candidateId: string | Candidate;
  jobId: string | Job;
  round: InterviewRound;
  status: InterviewStatus;
  scheduledDate: string;
  duration?: number;
  interviewerName?: string;
  interviewerEmail?: string;
  location?: string;
  meetingLink?: string;
  feedback?: string;
  rating?: number;
  notes?: string;
  rescheduleReason?: string;
  createdAt: string;
  updatedAt: string;
}

// ── Matching ───────────────────────────────

export interface ScoreBreakdown {
  semantic: number;
  skills: number;
  experience: number;
  projects: number;
  education: number;
}

export interface MatchingResult {
  _id: string;
  jobId: string;
  candidateId: string | Candidate;
  semanticScore: number;
  skillScore: number;
  experienceScore: number;
  projectScore: number;
  educationScore: number;
  finalScore: number;
  breakdown: ScoreBreakdown;
  matchedSkills?: string[];
  unmatchedSkills?: string[];
  rank?: number;
  createdAt: string;
}

// ── Analytics ──────────────────────────────

export interface DashboardMetrics {
  totalCandidates: number;
  totalJobs: number;
  openJobs: number;
  selectedCandidates: number;
  shortlistedCandidates: number;
  rejectedCandidates: number;
  upcomingInterviews: number;
}

export interface AggregationItem {
  _id: string;
  count: number;
}

export interface JobAnalytics {
  byStatus: AggregationItem[];
  topMatchedJobs: { _id: string; averageScore: number; candidates: number }[];
}

export interface CandidateAnalytics {
  byStatus: AggregationItem[];
  bySource: AggregationItem[];
  topSkills: AggregationItem[];
}

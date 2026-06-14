export enum UserRole {
  ADMIN = 'admin',
  RECRUITER = 'recruiter',
  CANDIDATE = 'candidate',
}

export enum CandidateStatus {
  APPLIED = 'applied',
  REVIEWED = 'reviewed',
  SHORTLISTED = 'shortlisted',
  REJECTED = 'rejected',
  SELECTED = 'selected',
  OFFER_EXTENDED = 'offer_extended',
  OFFER_ACCEPTED = 'offer_accepted',
  OFFER_DECLINED = 'offer_declined',
  ONBOARDING = 'onboarding',
  JOINED = 'joined',
}

export enum JobStatus {
  DRAFT = 'draft',
  OPEN = 'open',
  CLOSED = 'closed',
  FILLED = 'filled',
  ON_HOLD = 'on_hold',
}

export enum ResumeSource {
  EMAIL = 'email',
  MANUAL = 'manual',
  WEBSITE = 'website',
}

export enum InterviewStatus {
  SCHEDULED = 'scheduled',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  RESCHEDULED = 'rescheduled',
}

export enum InterviewRound {
  PHONE_SCREENING = 'phone_screening',
  TECHNICAL = 'technical',
  HR = 'hr',
  FINAL = 'final',
}

export enum OfferStatus {
  PENDING = 'pending',
  SENT = 'sent',
  ACCEPTED = 'accepted',
  DECLINED = 'declined',
  EXPIRED = 'expired',
}

export enum NotificationType {
  SHORTLISTED = 'shortlisted',
  REJECTED = 'rejected',
  INTERVIEW_SCHEDULED = 'interview_scheduled',
  OFFER_EXTENDED = 'offer_extended',
  INTERVIEW_ROUND_UPDATED = 'interview_round_updated',
  INTERVIEW_RESCHEDULE = 'interview_reschedule',
}

export enum EmailTemplate {
  CANDIDATE_SHORTLIST = 'candidate_shortlist',
  CANDIDATE_REJECTION = 'candidate_rejection',
  INTERVIEW_SCHEDULED = 'interview_scheduled',
  OFFER_LETTER = 'offer_letter',
  CANDIDATE_LOGIN_CREDENTIALS = 'candidate_login_credentials',
  PASSWORD_RESET = 'password_reset',
}

export const HTTP_STATUS_CODES = {
  OK: 200,
  CREATED: 201,
  ACCEPTED: 202,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
} as const;

export const ERROR_MESSAGES = {
  UNAUTHORIZED: 'Unauthorized access',
  FORBIDDEN: 'Forbidden',
  NOT_FOUND: 'Resource not found',
  INVALID_CREDENTIALS: 'Invalid email or password',
  DUPLICATE_EMAIL: 'Email already exists',
  INVALID_TOKEN: 'Invalid or expired token',
  MISSING_FIELDS: 'Missing required fields',
  INVALID_FILE_TYPE: 'Invalid file type',
  FILE_TOO_LARGE: 'File is too large',
  RESUME_PARSE_FAILED: 'Failed to parse resume',
  PINECONE_ERROR: 'Pinecone service error',
  GEMINI_ERROR: 'Gemini API error',
  DATABASE_ERROR: 'Database error',
  INTERNAL_ERROR: 'Internal server error',
  EMAIL_SEND_FAILED: 'Failed to send email',
  INVALID_ROLE: 'Invalid user role',
  INVALID_STATUS: 'Invalid candidate status',
} as const;

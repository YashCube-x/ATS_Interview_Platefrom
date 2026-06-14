export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
};

export const FILE_CONFIG = {
  ALLOWED_RESUME_TYPES: ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
  ALLOWED_RESUME_EXTENSIONS: ['.pdf', '.docx'],
  MAX_RESUME_SIZE: 5242880, // 5MB
};

export const JWT_CONFIG = {
  ALGORITHM: 'HS256',
};

export const EMAIL_CONFIG = {
  FROM: 'noreply@ats.com',
  SUPPORT: 'support@ats.com',
};

export const GEMINI_CONFIG = {
  MAX_OUTPUT_TOKENS: 2048,
  TEMPERATURE: 0.7,
};

export const PINECONE_CONFIG = {
  DIMENSION: 768,
  BATCH_SIZE: 100,
  TOP_K_RESULTS: 100,
};

export const SCORING_CONFIG = {
  MIN_SCORE: 0,
  MAX_SCORE: 100,
  PASSING_SCORE: 40,
};

export const REGEX = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE: /^[+]?[\d\s\-()]{7,}$/,
  URL: /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([/\w \.-]*)*\/?$/,
};

export const RATE_LIMIT = {
  AUTH_ENDPOINTS: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: process.env.NODE_ENV === 'development' ? 10000 : 5, // 5 requests per windowMs
  },
  API_ENDPOINTS: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: process.env.NODE_ENV === 'development' ? 10000 : 100, // 100 requests per windowMs
  },
  UPLOAD_ENDPOINTS: {
    windowMs: 60 * 60 * 1000, // 1 hour
    max: process.env.NODE_ENV === 'development' ? 10000 : 10, // 10 uploads per hour
  },
};

export const CANDIDATE_PORTAL_ROUTES = [
  '/api/portal/login',
  '/api/portal/register',
  '/api/portal/forgot-password',
  '/api/portal/reset-password',
  '/api/portal/profile',
  '/api/portal/status',
  '/api/portal/interviews',
  '/api/portal/offer',
  '/api/portal/onboarding',
];

import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

interface EnvConfig {
  // Server
  PORT: number;
  NODE_ENV: 'development' | 'production' | 'test';

  // Database
  MONGODB_URI: string;

  // JWT
  JWT_SECRET: string;
  JWT_REFRESH_SECRET: string;
  JWT_EXPIRY: string;
  JWT_REFRESH_EXPIRY: string;

  // Gemini API
  GEMINI_API_KEY: string;
  GEMINI_MODEL_NAME: string;

  // Ollama
  OLLAMA_BASE_URL: string;
  OLLAMA_MODEL: string;
  OLLAMA_EMBEDDING_MODEL: string;

  // Pinecone
  PINECONE_API_KEY: string;
  PINECONE_INDEX_NAME: string;
  PINECONE_ENVIRONMENT: string;

  // Cloudinary
  CLOUDINARY_CLOUD_NAME: string;
  CLOUDINARY_API_KEY: string;
  CLOUDINARY_API_SECRET: string;

  // Gmail API
  GMAIL_CLIENT_ID: string;
  GMAIL_CLIENT_SECRET: string;
  GMAIL_REFRESH_TOKEN: string;
  GMAIL_REDIRECT_URI: string;
  GMAIL_USER_EMAIL: string;

  // SMTP
  SMTP_HOST: string;
  SMTP_PORT: number;
  SMTP_USER: string;
  SMTP_PASS: string;

  // Frontend
  FRONTEND_URL: string;
  CORS_ORIGIN: string;

  // Logging
  LOG_LEVEL: string;

  // Email
  EMAIL_FROM: string;
  EMAIL_SUPPORT: string;

  // Rate Limiting
  RATE_LIMIT_WINDOW_MS: number;
  RATE_LIMIT_MAX_REQUESTS: number;

  // Resume Processing
  MAX_RESUME_FILE_SIZE: number;
  SUPPORTED_RESUME_FORMATS: string;

  // Matching Engine Weights
  SEMANTIC_WEIGHT: number;
  SKILL_WEIGHT: number;
  EXPERIENCE_WEIGHT: number;
  PROJECT_WEIGHT: number;
  EDUCATION_WEIGHT: number;

  // Pinecone Configuration
  PINECONE_BATCH_SIZE: number;
  PINECONE_TOP_CANDIDATES: number;
}

const requiredEnvVars = [
  'MONGODB_URI',
  'JWT_SECRET',
  'JWT_REFRESH_SECRET',
  'GEMINI_API_KEY',
  'GEMINI_MODEL_NAME',
  'PINECONE_API_KEY',
  'PINECONE_INDEX_NAME',
  'PINECONE_ENVIRONMENT',
  'CLOUDINARY_CLOUD_NAME',
  'CLOUDINARY_API_KEY',
  'CLOUDINARY_API_SECRET',
  'SMTP_HOST',
  'SMTP_USER',
  'SMTP_PASS',
  'FRONTEND_URL',
  'CORS_ORIGIN',
];

const validateEnv = (): void => {
  const missingVars = requiredEnvVars.filter((varName) => !process.env[varName]);

  if (missingVars.length > 0) {
    throw new Error(
      `Missing required environment variables:\n${missingVars.map((v) => `  - ${v}`).join('\n')}\n\nPlease check your .env file or set these variables.`
    );
  }
};

const getEnvConfig = (): EnvConfig => {
  validateEnv();

  return {
    PORT: parseInt(process.env.PORT || '5000', 10),
    NODE_ENV: (process.env.NODE_ENV as 'development' | 'production' | 'test') || 'development',
    MONGODB_URI: process.env.MONGODB_URI!,
    JWT_SECRET: process.env.JWT_SECRET!,
    JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET!,
    JWT_EXPIRY: process.env.JWT_EXPIRY || '7d',
    JWT_REFRESH_EXPIRY: process.env.JWT_REFRESH_EXPIRY || '30d',
    GEMINI_API_KEY: process.env.GEMINI_API_KEY!,
    GEMINI_MODEL_NAME: process.env.GEMINI_MODEL_NAME!,
    OLLAMA_BASE_URL: process.env.OLLAMA_BASE_URL || 'http://localhost:11434',
    OLLAMA_MODEL: process.env.OLLAMA_MODEL || 'qwen2.5:3b',
    OLLAMA_EMBEDDING_MODEL: process.env.OLLAMA_EMBEDDING_MODEL || 'nomic-embed-text',
    PINECONE_API_KEY: process.env.PINECONE_API_KEY!,
    PINECONE_INDEX_NAME: process.env.PINECONE_INDEX_NAME!,
    PINECONE_ENVIRONMENT: process.env.PINECONE_ENVIRONMENT!,
    CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME!,
    CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY!,
    CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET!,
    GMAIL_CLIENT_ID: process.env.GMAIL_CLIENT_ID || '',
    GMAIL_CLIENT_SECRET: process.env.GMAIL_CLIENT_SECRET || '',
    GMAIL_REFRESH_TOKEN: process.env.GMAIL_REFRESH_TOKEN || '',
    GMAIL_REDIRECT_URI: process.env.GMAIL_REDIRECT_URI || '',
    GMAIL_USER_EMAIL: process.env.GMAIL_USER_EMAIL || '',
    SMTP_HOST: process.env.SMTP_HOST!,
    SMTP_PORT: parseInt(process.env.SMTP_PORT || '587', 10),
    SMTP_USER: process.env.SMTP_USER!,
    SMTP_PASS: process.env.SMTP_PASS!,
    FRONTEND_URL: process.env.FRONTEND_URL!,
    CORS_ORIGIN: process.env.CORS_ORIGIN!,
    LOG_LEVEL: process.env.LOG_LEVEL || 'info',
    EMAIL_FROM: process.env.EMAIL_FROM || 'noreply@ats.com',
    EMAIL_SUPPORT: process.env.EMAIL_SUPPORT || 'support@ats.com',
    RATE_LIMIT_WINDOW_MS: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10),
    RATE_LIMIT_MAX_REQUESTS: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),
    MAX_RESUME_FILE_SIZE: parseInt(process.env.MAX_RESUME_FILE_SIZE || '5242880', 10),
    SUPPORTED_RESUME_FORMATS: process.env.SUPPORTED_RESUME_FORMATS || 'pdf,docx',
    SEMANTIC_WEIGHT: parseFloat(process.env.SEMANTIC_WEIGHT || '0.4'),
    SKILL_WEIGHT: parseFloat(process.env.SKILL_WEIGHT || '0.3'),
    EXPERIENCE_WEIGHT: parseFloat(process.env.EXPERIENCE_WEIGHT || '0.15'),
    PROJECT_WEIGHT: parseFloat(process.env.PROJECT_WEIGHT || '0.1'),
    EDUCATION_WEIGHT: parseFloat(process.env.EDUCATION_WEIGHT || '0.05'),
    PINECONE_BATCH_SIZE: parseInt(process.env.PINECONE_BATCH_SIZE || '100', 10),
    PINECONE_TOP_CANDIDATES: parseInt(process.env.PINECONE_TOP_CANDIDATES || '100', 10),
  };
};

export const envConfig = getEnvConfig();

export default envConfig;

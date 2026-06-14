import { GoogleGenerativeAI } from '@google/generative-ai';
import { Logger } from '@common/logger';
import { envConfig } from './env.config';

const logger = new Logger('GeminiConfig');

let geminiInstance: GoogleGenerativeAI | null = null;

export const initGemini = (): GoogleGenerativeAI => {
  try {
    logger.info('Initializing Gemini API...');
    geminiInstance = new GoogleGenerativeAI(envConfig.GEMINI_API_KEY);
    logger.info('Gemini API initialized successfully');
    return geminiInstance;
  } catch (error) {
    logger.error('Failed to initialize Gemini API', error);
    throw error;
  }
};

export const getGeminiInstance = (): GoogleGenerativeAI => {
  if (!geminiInstance) {
    logger.warn('Gemini instance not initialized, initializing now...');
    return initGemini();
  }
  return geminiInstance;
};

export const getGeminiModel = () => {
  const instance = getGeminiInstance();
  return instance.getGenerativeModel({ model: envConfig.GEMINI_MODEL_NAME });
};

export default {
  initGemini,
  getGeminiInstance,
  getGeminiModel,
};

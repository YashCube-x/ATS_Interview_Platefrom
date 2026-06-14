import mongoose from 'mongoose';
import { Logger } from '@common/logger';
import { envConfig } from './env.config';

const logger = new Logger('DatabaseConfig');

export const connectDatabase = async (): Promise<void> => {
  try {
    logger.info('Connecting to MongoDB...');
    await mongoose.connect(envConfig.MONGODB_URI, {
      retryWrites: true,
      w: 'majority',
    });
    logger.info('MongoDB connected successfully');
  } catch (error) {
    logger.error('Failed to connect to MongoDB', error);
    throw error;
  }
};

export const disconnectDatabase = async (): Promise<void> => {
  try {
    await mongoose.disconnect();
    logger.info('MongoDB disconnected');
  } catch (error) {
    logger.error('Failed to disconnect from MongoDB', error);
    throw error;
  }
};

export default connectDatabase;

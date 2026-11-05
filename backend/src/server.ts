import { createApp } from './app';
import { connectDatabase } from '@config/database.config';
import { initCloudinary } from '@config/cloudinary.config';
import { initPinecone, createPineconeIndex } from '@config/pinecone.config';
import { initGemini } from '@config/gemini.config';
import { envConfig } from '@config/env.config';
import { Logger } from '@common/logger';
import { EmailService } from '@services/email/email.service';

const logger = new Logger('Server');

const startServer = async () => {
  try {
    logger.info(`Starting ATS Backend Server in ${envConfig.NODE_ENV} mode...`);

    // Initialize all services
    logger.info('Initializing services...');

    // Connect to MongoDB
    logger.info('[MongoDB] Connecting...');
    await connectDatabase();
    logger.info('✓ MongoDB connected');

    // Initialize Cloudinary
    try {
      if (envConfig.CLOUDINARY_CLOUD_NAME && envConfig.CLOUDINARY_API_KEY) {
        initCloudinary();
        logger.info('✓ Cloudinary initialized');
      } else {
        logger.warn('⚠ Cloudinary credentials missing, using local/dummy storage mode');
      }
    } catch (err) {
      logger.warn('⚠ Cloudinary initialization failed, continuing...', err);
    }

    // Initialize Pinecone
    try {
      if (envConfig.PINECONE_API_KEY) {
        await initPinecone();
        logger.info('✓ Pinecone initialized');
        try {
          await createPineconeIndex(envConfig.PINECONE_INDEX_NAME);
          logger.info('✓ Pinecone index created/verified');
        } catch (error) {
          logger.warn('Pinecone index creation skipped', error);
        }
      } else {
        logger.warn('⚠ Pinecone API key missing, semantic vector search running in fallback mode');
      }
    } catch (err) {
      logger.warn('⚠ Pinecone initialization failed, continuing...', err);
    }

    // Initialize Gemini
    try {
      if (envConfig.GEMINI_API_KEY) {
        initGemini();
        logger.info('✓ Gemini API initialized');
      } else {
        logger.warn('⚠ Gemini API key missing, local Ollama / regex fallback will handle parsing');
      }
    } catch (err) {
      logger.warn('⚠ Gemini initialization failed, continuing...', err);
    }

    // Verify email service
    try {
      const emailService = new EmailService();
      const emailVerified = await emailService.verifyConnection();
      if (emailVerified) {
        logger.info('✓ Email service verified');
      } else {
        logger.warn('⚠ Email service verification failed, but continuing...');
      }
    } catch (err) {
      logger.warn('⚠ Email service check skipped, continuing...');
    }

    // Create Express app
    const app = createApp();

    // Start server
    const server = app.listen(envConfig.PORT, () => {
      logger.info(`═══════════════════════════════════════════════════`);
      logger.info(`  ATS Backend Server Started Successfully`);
      logger.info(`═══════════════════════════════════════════════════`);
      logger.info(`  Server running on: http://localhost:${envConfig.PORT}`);
      logger.info(`  Environment: ${envConfig.NODE_ENV}`);
      logger.info(`  Health Check: http://localhost:${envConfig.PORT}/health`);
      logger.info(`═══════════════════════════════════════════════════`);
    });

    // Graceful shutdown
    process.on('SIGTERM', () => {
      logger.info('SIGTERM signal received: closing HTTP server');
      server.close();
      process.exit(0);
    });

    process.on('SIGINT', () => {
      logger.info('SIGINT signal received: closing HTTP server');
      server.close();
      process.exit(0);
    });

    process.on('unhandledRejection', (reason, promise) => {
      logger.error(`Unhandled Rejection at: ${String(promise)} reason: ${String(reason)}`);
    });
    process.on('uncaughtException', (error) => {
      logger.error('Uncaught Exception:', error);
      process.exit(1);
    });
  } catch (error) {
    logger.error('Failed to start server', error);
    process.exit(1);
  }
};

// Start the server
startServer();

// Trigger nodemon restart


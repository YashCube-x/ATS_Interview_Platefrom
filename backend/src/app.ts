import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { envConfig } from '@config/env.config';
import { Logger } from '@common/logger';
import errorMiddleware from '@middleware/error.middleware';
import { RATE_LIMIT } from '@common/constants';
import { ResponseBuilder } from '@common/responses';
import apiRoutes from '@routes/index';

const logger = new Logger('App');

export const createApp = (): Application => {
  const app = express();

  // Security middleware
  app.use(helmet());

  // CORS
  app.use(
    cors({
      origin: envConfig.CORS_ORIGIN,
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    })
  );

  // Body parser middleware
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ limit: '10mb', extended: true }));

  // Rate limiting
  const authLimiter = rateLimit({
    windowMs: RATE_LIMIT.AUTH_ENDPOINTS.windowMs,
    max: RATE_LIMIT.AUTH_ENDPOINTS.max,
    message: 'Too many authentication attempts, please try again later',
  });

  const apiLimiter = rateLimit({
    windowMs: RATE_LIMIT.API_ENDPOINTS.windowMs,
    max: RATE_LIMIT.API_ENDPOINTS.max,
    message: 'Too many requests, please try again later',
  });

  // Apply rate limiter to API endpoints
  app.use('/api/', apiLimiter);
  app.use('/api/auth/login', authLimiter);
  app.use('/api/auth/register', authLimiter);

  // Logging middleware
  app.use((req: Request, res: Response, next: NextFunction) => {
    logger.info(`${req.method} ${req.path}`);
    next();
  });

  // Health check
  app.get('/health', (req: Request, res: Response) => {
    res.json(
      ResponseBuilder.success(
        {
          status: 'OK',
          timestamp: new Date().toISOString(),
          environment: envConfig.NODE_ENV,
        },
        'Server is running'
      )
    );
  });

  app.use('/api', apiRoutes);

  // 404 handler
  app.use((req: Request, res: Response) => {
    res.status(404).json(
      ResponseBuilder.error(`Route ${req.path} not found`)
    );
  });

  // Error handler (must be last)
  app.use(errorMiddleware);

  return app;
};

export default createApp;
// Trigger nodemon server auto-reload attempt 2

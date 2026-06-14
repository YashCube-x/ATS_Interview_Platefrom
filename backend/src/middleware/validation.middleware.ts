import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';
import { BadRequestError } from '@common/errors';
import { Logger } from '@common/logger';

const logger = new Logger('ValidationMiddleware');

export const validateRequest = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse(req.body);
      next();
    } catch (error: any) {
      logger.error('Validation error', error);
      const details = error.errors?.map((e: any) => `${e.path.join('.')}: ${e.message}`) || [];
      next(new BadRequestError('Validation failed', details));
    }
  };
};

export const validateQuery = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse(req.query);
      next();
    } catch (error: any) {
      logger.error('Query validation error', error);
      const details = error.errors?.map((e: any) => `${e.path.join('.')}: ${e.message}`) || [];
      next(new BadRequestError('Query validation failed', details));
    }
  };
};

export const validateParams = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse(req.params);
      next();
    } catch (error: any) {
      logger.error('Params validation error', error);
      const details = error.errors?.map((e: any) => `${e.path.join('.')}: ${e.message}`) || [];
      next(new BadRequestError('Params validation failed', details));
    }
  };
};

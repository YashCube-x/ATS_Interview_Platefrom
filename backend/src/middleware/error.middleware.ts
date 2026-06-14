import { Request, Response, NextFunction } from 'express';
import { AppError } from '@common/errors';
import { Logger } from '@common/logger';
import { ResponseBuilder } from '@common/responses';

const logger = new Logger('ErrorMiddleware');

export const errorMiddleware = (
  error: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  logger.error(`Error in ${req.method} ${req.path}`, error);

  if (error instanceof AppError) {
    res.status(error.statusCode).json(
      ResponseBuilder.error(error.message, error.details)
    );
    return;
  }

  // Handle Zod validation errors
  if (error.name === 'ZodError') {
    const details = (error as any).errors?.map((e: any) => `${e.path.join('.')}: ${e.message}`) || [];
    res.status(400).json(
      ResponseBuilder.error('Validation error', details)
    );
    return;
  }

  // Handle MongoDB duplicate key error
  if ((error as any).code === 11000) {
    const field = Object.keys((error as any).keyPattern)[0];
    res.status(409).json(
      ResponseBuilder.error(`Duplicate value for field: ${field}`)
    );
    return;
  }

  // Handle MongoDB cast error
  if (error.name === 'CastError') {
    res.status(400).json(
      ResponseBuilder.error('Invalid ID format')
    );
    return;
  }

  // Default error
  res.status(500).json(
    ResponseBuilder.error('Internal server error')
  );
};

export default errorMiddleware;

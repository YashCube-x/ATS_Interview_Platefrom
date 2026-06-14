import { HTTP_STATUS_CODES } from '@common/enums';

export class AppError extends Error {
  constructor(
    public message: string,
    public statusCode: number = HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
    public details?: string[]
  ) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  constructor(message: string = 'Validation failed', details?: string[]) {
    super(message, HTTP_STATUS_CODES.BAD_REQUEST, details);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = 'Unauthorized') {
    super(message, HTTP_STATUS_CODES.UNAUTHORIZED);
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string = 'Forbidden') {
    super(message, HTTP_STATUS_CODES.FORBIDDEN);
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = 'Resource not found') {
    super(message, HTTP_STATUS_CODES.NOT_FOUND);
  }
}

export class ConflictError extends AppError {
  constructor(message: string = 'Conflict') {
    super(message, HTTP_STATUS_CODES.CONFLICT);
  }
}

export class InternalServerError extends AppError {
  constructor(message: string = 'Internal server error') {
    super(message, HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR);
  }
}

export class BadRequestError extends AppError {
  constructor(message: string = 'Bad request', details?: string[]) {
    super(message, HTTP_STATUS_CODES.BAD_REQUEST, details);
  }
}

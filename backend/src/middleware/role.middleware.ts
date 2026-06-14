import { Response, NextFunction } from 'express';
import { ForbiddenError } from '@common/errors';
import { Logger } from '@common/logger';
import { UserRole } from '@common/enums';
import { AuthenticatedRequest } from './auth.middleware';

const logger = new Logger('RoleMiddleware');

export const requireRole = (...allowedRoles: UserRole[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        throw new ForbiddenError('User not authenticated');
      }

      if (!allowedRoles.includes(req.user.role as UserRole)) {
        logger.warn(`Access denied for user ${req.user.id} with role ${req.user.role}`);
        throw new ForbiddenError(`Access denied. Required roles: ${allowedRoles.join(', ')}`);
      }

      next();
    } catch (error) {
      if (error instanceof ForbiddenError) {
        res.status(error.statusCode).json({
          success: false,
          error: error.message,
        });
      } else {
        res.status(403).json({
          success: false,
          error: 'Forbidden',
        });
      }
    }
  };
};

export const requireAdmin = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  requireRole(UserRole.ADMIN)(req, res, next);
};

export const requireRecruiter = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  requireRole(UserRole.RECRUITER, UserRole.ADMIN)(req, res, next);
};

export const requireCandidate = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  requireRole(UserRole.CANDIDATE)(req, res, next);
};

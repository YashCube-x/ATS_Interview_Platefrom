import { Response, NextFunction } from 'express';
import PortalService from './candidatePortal.service';
import { AuthenticatedRequest } from '@middleware/auth.middleware';
import { ResponseBuilder } from '@common/responses';

export class CandidatePortalController {
  async login(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await PortalService.login(req.body.email, req.body.password);
      res.json(ResponseBuilder.success(result, 'Portal login successful'));
    } catch (error) {
      next(error);
    }
  }

  async profile(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const profile = await PortalService.getProfile(req.user!.id);
      res.json(ResponseBuilder.success(profile));
    } catch (error) {
      next(error);
    }
  }

  async status(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const status = await PortalService.getStatus(req.user!.id);
      res.json(ResponseBuilder.success(status));
    } catch (error) {
      next(error);
    }
  }

  async requestPasswordReset(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      await PortalService.requestPasswordReset(req.body.email);
      res.json(ResponseBuilder.success(null, 'If an active portal account exists, reset instructions were sent'));
    } catch (error) {
      next(error);
    }
  }

  async resetPassword(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      await PortalService.resetPassword(req.body.token, req.body.password);
      res.json(ResponseBuilder.success(null, 'Password reset successful'));
    } catch (error) {
      next(error);
    }
  }
}

export default new CandidatePortalController();

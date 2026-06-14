import { Response, NextFunction } from 'express';
import NotificationService from './notification.service';
import { AuthenticatedRequest } from '@middleware/auth.middleware';
import { ResponseBuilder } from '@common/responses';

export class NotificationController {
  async notifyCandidateStatus(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await NotificationService.notifyCandidateStatusChange(
        req.body.candidate,
        req.body.status,
        req.body.jobTitle
      );
      res.json(ResponseBuilder.success(result, 'Notification processed'));
    } catch (error) {
      next(error);
    }
  }
}

export default new NotificationController();

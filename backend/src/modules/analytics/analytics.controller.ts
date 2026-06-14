import { Response, NextFunction } from 'express';
import AnalyticsService from './analytics.service';
import { AuthenticatedRequest } from '@middleware/auth.middleware';
import { ResponseBuilder } from '@common/responses';

export class AnalyticsController {
  async dashboard(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      res.json(ResponseBuilder.success(await AnalyticsService.getDashboard()));
    } catch (error) {
      next(error);
    }
  }

  async jobs(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      res.json(ResponseBuilder.success(await AnalyticsService.getJobAnalytics()));
    } catch (error) {
      next(error);
    }
  }

  async candidates(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      res.json(ResponseBuilder.success(await AnalyticsService.getCandidateAnalytics()));
    } catch (error) {
      next(error);
    }
  }
}

export default new AnalyticsController();

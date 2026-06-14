import { Response, NextFunction } from 'express';
import MatchingService from './matching.service';
import { AuthenticatedRequest } from '@middleware/auth.middleware';
import { ResponseBuilder } from '@common/responses';

export class MatchingController {
  async runForJob(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await MatchingService.matchCandidatesToJob(req.params.jobId);
      res.json(ResponseBuilder.success(result, 'Matching completed'));
    } catch (error) {
      next(error);
    }
  }

  async getResults(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await MatchingService.getMatchingResults(
        req.params.jobId,
        Number(req.query.page) || 1,
        Number(req.query.limit) || 20
      );
      res.json(ResponseBuilder.success(result));
    } catch (error) {
      next(error);
    }
  }

  async getTop(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await MatchingService.getTopCandidatesForJob(
        req.params.jobId,
        Number(req.query.limit) || 10
      );
      res.json(ResponseBuilder.success(result));
    } catch (error) {
      next(error);
    }
  }

  async recalculate(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      await MatchingService.recalculateMatchingForJob(req.params.jobId);
      res.json(ResponseBuilder.success(null, 'Matching recalculated'));
    } catch (error) {
      next(error);
    }
  }
}

export default new MatchingController();

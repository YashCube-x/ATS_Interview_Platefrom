import { Response, NextFunction } from 'express';
import InterviewService from './interview.service';
import { AuthenticatedRequest } from '@middleware/auth.middleware';
import { ResponseBuilder } from '@common/responses';

export class InterviewController {
  async create(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const interview = await InterviewService.create(req.body);
      res.status(201).json(ResponseBuilder.success(interview, 'Interview scheduled'));
    } catch (error) {
      next(error);
    }
  }

  async list(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const interviews = await InterviewService.list({
        candidateId: req.query.candidateId as string,
        jobId: req.query.jobId as string,
        status: req.query.status as string,
      });
      res.json(ResponseBuilder.success(interviews));
    } catch (error) {
      next(error);
    }
  }

  async getById(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const interview = await InterviewService.getById(req.params.id);
      res.json(ResponseBuilder.success(interview));
    } catch (error) {
      next(error);
    }
  }

  async update(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const interview = await InterviewService.update(req.params.id, req.body);
      res.json(ResponseBuilder.success(interview, 'Interview updated'));
    } catch (error) {
      next(error);
    }
  }

  async delete(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      await InterviewService.delete(req.params.id);
      res.json(ResponseBuilder.success(null, 'Interview deleted'));
    } catch (error) {
      next(error);
    }
  }
}

export default new InterviewController();

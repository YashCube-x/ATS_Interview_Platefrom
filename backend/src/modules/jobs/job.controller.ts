import { Response, NextFunction } from 'express';
import JobService from './job.service';
import { AuthenticatedRequest } from '@middleware/auth.middleware';
import { ResponseBuilder } from '@common/responses';
import { JobStatus } from '@common/enums';

export class JobController {
  async create(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const job = await JobService.createJob({ ...req.body, createdBy: req.user!.id });
      res.status(201).json(ResponseBuilder.success(job, 'Job created'));
    } catch (error) {
      next(error);
    }
  }

  async list(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await JobService.listJobs({
        status: req.query.status as JobStatus,
        createdBy: req.query.createdBy as string,
        page: Number(req.query.page) || 1,
        limit: Number(req.query.limit) || 20,
      });
      res.json(ResponseBuilder.paginated(result.jobs, result.total, result.page, result.limit));
    } catch (error) {
      next(error);
    }
  }

  async getById(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const job = await JobService.getJobById(req.params.id);
      res.json(ResponseBuilder.success(job));
    } catch (error) {
      next(error);
    }
  }

  async update(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const job = await JobService.updateJob(req.params.id, req.body);
      res.json(ResponseBuilder.success(job, 'Job updated'));
    } catch (error) {
      next(error);
    }
  }

  async delete(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      await JobService.deleteJob(req.params.id);
      res.json(ResponseBuilder.success(null, 'Job deleted'));
    } catch (error) {
      next(error);
    }
  }

  async updateStatus(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const job = await JobService.updateJobStatus(req.params.id, req.body.status);
      res.json(ResponseBuilder.success(job, 'Job status updated'));
    } catch (error) {
      next(error);
    }
  }
}

export default new JobController();

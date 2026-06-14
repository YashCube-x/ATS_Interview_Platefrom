import { Response, NextFunction } from 'express';
import ResumeService from './resume.service';
import { AuthenticatedRequest } from '@middleware/auth.middleware';
import { ResponseBuilder } from '@common/responses';
import { BadRequestError } from '@common/errors';
import { ResumeSource } from '@common/enums';

export class ResumeController {
  async upload(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.file) {
        throw new BadRequestError('Resume file is required');
      }

      const result = await ResumeService.uploadAndParseResume(
        req.file.buffer,
        req.file.originalname,
        ResumeSource.MANUAL
      );

      res.status(201).json(ResponseBuilder.success(result, 'Resume uploaded and processed'));
    } catch (error) {
      next(error);
    }
  }

  async process(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.file) {
        throw new BadRequestError('Resume file is required');
      }

      const result = await ResumeService.getResumeExtraction(req.file.buffer, req.file.originalname);
      res.json(ResponseBuilder.success(result, 'Resume extracted'));
    } catch (error) {
      next(error);
    }
  }

  async reprocess(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.file) {
        throw new BadRequestError('Resume file is required');
      }

      const result = await ResumeService.reprocessResume(req.params.candidateId, req.file.buffer, req.file.originalname);
      res.json(ResponseBuilder.success(result, 'Resume reprocessed'));
    } catch (error) {
      next(error);
    }
  }
}

export default new ResumeController();

import { Request, Response, NextFunction } from 'express';
import WebApplicationService from './webApplication.service';
import { AuthenticatedRequest } from '@middleware/auth.middleware';
import { ResponseBuilder } from '@common/responses';
import { BadRequestError } from '@common/errors';
import { WebAppStatus } from '@database/models/webApplication.model';

const VALID_STATUSES: WebAppStatus[] = ['new', 'reviewed', 'converted', 'rejected'];

export class WebApplicationController {
  /**
   * PUBLIC endpoint — called by the main AshtaTech website.
   * Accepts multipart/form-data with an optional 'resume' file field.
   */
  async submit(req: Request, res: Response, next: NextFunction) {
    try {
      const { fullName, email, phone, positionApplied, coverLetter } = req.body;

      if (!fullName || !email || !positionApplied) {
        throw new BadRequestError('fullName, email, and positionApplied are required');
      }

      // Email format validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        throw new BadRequestError('Invalid email address');
      }

      const resumeFile = req.file
        ? { buffer: req.file.buffer, originalname: req.file.originalname }
        : undefined;

      const meta = {
        ipAddress: req.ip || req.socket?.remoteAddress,
        referrerUrl: req.get('Referer'),
      };

      const application = await WebApplicationService.submitApplication(
        { fullName, email, phone, positionApplied, coverLetter },
        resumeFile,
        meta
      );

      res.status(201).json(
        ResponseBuilder.success(
          {
            id: application._id,
            fullName: application.fullName,
            email: application.email,
            positionApplied: application.positionApplied,
            status: application.status,
            submittedAt: application.createdAt,
          },
          'Application submitted successfully! We will review it and get back to you.'
        )
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * INTERNAL — list all web applications (requires auth).
   */
  async list(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { status, page, limit } = req.query;

      const result = await WebApplicationService.listApplications({
        status: status as WebAppStatus | undefined,
        page: page ? parseInt(page as string) : undefined,
        limit: limit ? parseInt(limit as string) : undefined,
      });

      res.json(ResponseBuilder.success(result, 'Website applications fetched'));
    } catch (error) {
      next(error);
    }
  }

  /**
   * INTERNAL — get single web application (requires auth).
   */
  async getOne(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const application = await WebApplicationService.getApplicationById(req.params.id);
      res.json(ResponseBuilder.success(application, 'Application fetched'));
    } catch (error) {
      next(error);
    }
  }

  /**
   * INTERNAL — update review status (requires auth).
   */
  async updateStatus(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { status } = req.body;
      if (!status || !VALID_STATUSES.includes(status)) {
        throw new BadRequestError(`status must be one of: ${VALID_STATUSES.join(', ')}`);
      }

      const application = await WebApplicationService.updateStatus(req.params.id, status as WebAppStatus);
      res.json(ResponseBuilder.success(application, 'Status updated'));
    } catch (error) {
      next(error);
    }
  }

  /**
   * INTERNAL — summary counts for dashboard widget.
   */
  async summary(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const data = await WebApplicationService.getSummary();
      res.json(ResponseBuilder.success(data, 'Summary fetched'));
    } catch (error) {
      next(error);
    }
  }
}

export default new WebApplicationController();

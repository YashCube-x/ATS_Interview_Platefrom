import { Response, NextFunction } from 'express';
import EmailService from '@services/email/email.service';
import EmailIngestionService from './emailIngestion.service';
import { AuthenticatedRequest } from '@middleware/auth.middleware';
import { ResponseBuilder } from '@common/responses';

export class EmailController {
  async send(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await EmailService.sendEmail(req.body);
      res.json(ResponseBuilder.success({ messageId: result.messageId }, 'Email sent'));
    } catch (error) {
      next(error);
    }
  }

  async verify(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const connected = await EmailService.verifyConnection();
      res.json(ResponseBuilder.success({ connected }));
    } catch (error) {
      next(error);
    }
  }

  async ingestResumes(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const processed = await EmailIngestionService.ingestLatestResumes(Number(req.query.limit) || 10);
      res.json(ResponseBuilder.success(processed, 'Email resume ingestion completed'));
    } catch (error) {
      next(error);
    }
  }
}

export default new EmailController();

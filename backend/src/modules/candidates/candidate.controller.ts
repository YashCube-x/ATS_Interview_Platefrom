import { Response, NextFunction } from 'express';
import CandidateService from './candidate.service';
import PortalService from '@modules/candidatePortal/candidatePortal.service';
import { AuthenticatedRequest } from '@middleware/auth.middleware';
import { ResponseBuilder } from '@common/responses';
import { CandidateStatus } from '@common/enums';

export class CandidateController {
  async create(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const candidate = await CandidateService.createCandidate(req.body);
      res.status(201).json(ResponseBuilder.success(candidate, 'Candidate created'));
    } catch (error) {
      next(error);
    }
  }

  async list(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await CandidateService.listCandidates({
        status: req.query.status as CandidateStatus,
        source: req.query.source as string,
        page: Number(req.query.page) || 1,
        limit: Number(req.query.limit) || 20,
      });
      res.json(ResponseBuilder.paginated(result.candidates, result.total, result.page, result.limit));
    } catch (error) {
      next(error);
    }
  }

  async getById(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const candidate = await CandidateService.getCandidateById(req.params.id);
      res.json(ResponseBuilder.success(candidate));
    } catch (error) {
      next(error);
    }
  }

  async update(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const candidate = await CandidateService.updateCandidate(req.params.id, req.body);
      res.json(ResponseBuilder.success(candidate, 'Candidate updated'));
    } catch (error) {
      next(error);
    }
  }

  async delete(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      await CandidateService.deleteCandidate(req.params.id);
      res.json(ResponseBuilder.success(null, 'Candidate deleted'));
    } catch (error) {
      next(error);
    }
  }

  async updateStatus(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const candidate = await CandidateService.updateCandidateStatus(
        req.params.id,
        req.body.status,
        req.body.reason
      );

      if (req.body.status === CandidateStatus.SELECTED) {
        await PortalService.ensureCredentialsForSelectedCandidate(candidate);
      }

      res.json(ResponseBuilder.success(candidate, 'Candidate status updated'));
    } catch (error) {
      next(error);
    }
  }

  async addRating(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const candidate = await CandidateService.addRating(req.params.id, req.body);
      res.json(ResponseBuilder.success(candidate, 'Candidate rating saved'));
    } catch (error) {
      next(error);
    }
  }
}

export default new CandidateController();

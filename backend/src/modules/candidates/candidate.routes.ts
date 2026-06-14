import { Router } from 'express';
import CandidateController from './candidate.controller';
import { authMiddleware } from '@middleware/auth.middleware';
import { requireRecruiter } from '@middleware/role.middleware';
import { validateRequest } from '@middleware/validation.middleware';
import {
  createCandidateSchema,
  updateCandidateSchema,
  updateCandidateStatusSchema,
  ratingSchema,
} from './candidate.validation';

const router = Router();

router.use(authMiddleware, requireRecruiter);
router.get('/', CandidateController.list.bind(CandidateController));
router.get('/:id', CandidateController.getById.bind(CandidateController));
router.post('/', validateRequest(createCandidateSchema), CandidateController.create.bind(CandidateController));
router.put('/:id', validateRequest(updateCandidateSchema), CandidateController.update.bind(CandidateController));
router.delete('/:id', CandidateController.delete.bind(CandidateController));
router.patch('/:id/status', validateRequest(updateCandidateStatusSchema), CandidateController.updateStatus.bind(CandidateController));
router.post('/:id/rating', validateRequest(ratingSchema), CandidateController.addRating.bind(CandidateController));

export default router;

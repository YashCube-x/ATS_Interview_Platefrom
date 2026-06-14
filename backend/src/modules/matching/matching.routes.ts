import { Router } from 'express';
import MatchingController from './matching.controller';
import { authMiddleware } from '@middleware/auth.middleware';
import { requireRecruiter } from '@middleware/role.middleware';

const router = Router();

router.use(authMiddleware, requireRecruiter);
router.post('/job/:jobId', MatchingController.runForJob.bind(MatchingController));
router.get('/job/:jobId/results', MatchingController.getResults.bind(MatchingController));
router.get('/job/:jobId/top', MatchingController.getTop.bind(MatchingController));
router.post('/job/:jobId/recalculate', MatchingController.recalculate.bind(MatchingController));

export default router;

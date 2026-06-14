import { Router } from 'express';
import AnalyticsController from './analytics.controller';
import { authMiddleware } from '@middleware/auth.middleware';
import { requireRecruiter } from '@middleware/role.middleware';

const router = Router();

router.use(authMiddleware, requireRecruiter);
router.get('/dashboard', AnalyticsController.dashboard.bind(AnalyticsController));
router.get('/jobs', AnalyticsController.jobs.bind(AnalyticsController));
router.get('/candidates', AnalyticsController.candidates.bind(AnalyticsController));

export default router;

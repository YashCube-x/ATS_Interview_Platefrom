import { Router } from 'express';
import NotificationController from './notification.controller';
import { authMiddleware } from '@middleware/auth.middleware';
import { requireRecruiter } from '@middleware/role.middleware';
import { validateRequest } from '@middleware/validation.middleware';
import { candidateStatusNotificationSchema } from './notification.validation';

const router = Router();

router.use(authMiddleware, requireRecruiter);
router.post('/candidate-status', validateRequest(candidateStatusNotificationSchema), NotificationController.notifyCandidateStatus.bind(NotificationController));

export default router;

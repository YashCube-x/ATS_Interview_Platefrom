import { Router } from 'express';
import PortalController from './candidatePortal.controller';
import { authMiddleware } from '@middleware/auth.middleware';
import { requireCandidate } from '@middleware/role.middleware';
import { validateRequest } from '@middleware/validation.middleware';
import { portalLoginSchema, requestPasswordResetSchema, resetPasswordSchema } from './candidatePortal.validation';

const router = Router();

router.post('/login', validateRequest(portalLoginSchema), PortalController.login.bind(PortalController));
router.post('/password-reset/request', validateRequest(requestPasswordResetSchema), PortalController.requestPasswordReset.bind(PortalController));
router.post('/password-reset/confirm', validateRequest(resetPasswordSchema), PortalController.resetPassword.bind(PortalController));
router.get('/profile', authMiddleware, requireCandidate, PortalController.profile.bind(PortalController));
router.get('/status', authMiddleware, requireCandidate, PortalController.status.bind(PortalController));

export default router;

import { Router } from 'express';
import EmailController from './email.controller';
import { authMiddleware } from '@middleware/auth.middleware';
import { requireRecruiter } from '@middleware/role.middleware';
import { validateRequest } from '@middleware/validation.middleware';
import { sendEmailSchema } from './email.validation';

const router = Router();

router.use(authMiddleware, requireRecruiter);
router.post('/send', validateRequest(sendEmailSchema), EmailController.send.bind(EmailController));
router.get('/verify', EmailController.verify.bind(EmailController));
router.post('/ingest-resumes', EmailController.ingestResumes.bind(EmailController));

export default router;

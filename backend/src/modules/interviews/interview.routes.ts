import { Router } from 'express';
import InterviewController from './interview.controller';
import { authMiddleware } from '@middleware/auth.middleware';
import { requireRecruiter } from '@middleware/role.middleware';
import { validateRequest } from '@middleware/validation.middleware';
import { createInterviewSchema, updateInterviewSchema } from './interview.validation';

const router = Router();

router.use(authMiddleware, requireRecruiter);
router.post('/', validateRequest(createInterviewSchema), InterviewController.create.bind(InterviewController));
router.get('/', InterviewController.list.bind(InterviewController));
router.get('/:id', InterviewController.getById.bind(InterviewController));
router.put('/:id', validateRequest(updateInterviewSchema), InterviewController.update.bind(InterviewController));
router.delete('/:id', InterviewController.delete.bind(InterviewController));

export default router;

import { Router } from 'express';
import JobController from './job.controller';
import { authMiddleware } from '@middleware/auth.middleware';
import { requireRecruiter } from '@middleware/role.middleware';
import { validateRequest } from '@middleware/validation.middleware';
import { createJobSchema, updateJobSchema, updateJobStatusSchema } from './job.validation';

const router = Router();

router.use(authMiddleware, requireRecruiter);
router.post('/', validateRequest(createJobSchema), JobController.create.bind(JobController));
router.get('/', JobController.list.bind(JobController));
router.get('/:id', JobController.getById.bind(JobController));
router.put('/:id', validateRequest(updateJobSchema), JobController.update.bind(JobController));
router.delete('/:id', JobController.delete.bind(JobController));
router.patch('/:id/status', validateRequest(updateJobStatusSchema), JobController.updateStatus.bind(JobController));

export default router;

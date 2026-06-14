import { Router } from 'express';
import ResumeController from './resume.controller';
import { authMiddleware } from '@middleware/auth.middleware';
import { requireRecruiter } from '@middleware/role.middleware';
import resumeUploadMiddleware, { validateFileSize } from '@middleware/upload.middleware';

const router = Router();

router.use(authMiddleware, requireRecruiter);
router.post('/upload', resumeUploadMiddleware.single('resume'), validateFileSize, ResumeController.upload.bind(ResumeController));
router.post('/process', resumeUploadMiddleware.single('resume'), validateFileSize, ResumeController.process.bind(ResumeController));
router.post('/:candidateId/reprocess', resumeUploadMiddleware.single('resume'), validateFileSize, ResumeController.reprocess.bind(ResumeController));

export default router;

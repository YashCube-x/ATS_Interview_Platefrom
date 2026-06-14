import { Router } from 'express';
import authRoutes from '@modules/auth/auth.routes';
import candidateRoutes from '@modules/candidates/candidate.routes';
import resumeRoutes from '@modules/resumes/resume.routes';
import jobRoutes from '@modules/jobs/job.routes';
import matchingRoutes from '@modules/matching/matching.routes';
import interviewRoutes from '@modules/interviews/interview.routes';
import portalRoutes from '@modules/candidatePortal/candidatePortal.routes';
import analyticsRoutes from '@modules/analytics/analytics.routes';
import emailRoutes from '@modules/emails/email.routes';
import notificationRoutes from '@modules/notifications/notification.routes';
import webApplicationRoutes from '@modules/webApplications/webApplication.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/candidates', candidateRoutes);
router.use('/resumes', resumeRoutes);
router.use('/jobs', jobRoutes);
router.use('/matching', matchingRoutes);
router.use('/interviews', interviewRoutes);
router.use('/portal', portalRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/emails', emailRoutes);
router.use('/notifications', notificationRoutes);
router.use('/web-applications', webApplicationRoutes);

export default router;


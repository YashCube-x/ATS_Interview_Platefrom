import { Router } from 'express';
import { validateRequest } from '@middleware/validation.middleware';
import { authMiddleware } from '@middleware/auth.middleware';
import AuthController from './auth.controller';
import { registerSchema, loginSchema, refreshTokenSchema } from './auth.validation';

const router = Router();

router.post('/register', validateRequest(registerSchema), AuthController.register.bind(AuthController));

router.post('/login', validateRequest(loginSchema), AuthController.login.bind(AuthController));

router.post('/refresh-token', validateRequest(refreshTokenSchema), AuthController.refreshToken.bind(AuthController));

router.get('/gmail', AuthController.redirectToGmailAuth.bind(AuthController));

router.get('/gmail/url', AuthController.getGmailAuthUrl.bind(AuthController));

router.get('/gmail/callback', AuthController.gmailCallback.bind(AuthController));

router.post('/change-password', authMiddleware, AuthController.changePassword.bind(AuthController));

router.get('/profile', authMiddleware, AuthController.getProfile.bind(AuthController));

export default router;

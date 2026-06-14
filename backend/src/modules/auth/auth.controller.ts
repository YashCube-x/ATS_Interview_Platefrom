import { Request, Response, NextFunction } from 'express';
import { ResponseBuilder } from '@common/responses';
import { Logger } from '@common/logger';
import AuthService from './auth.service';
import { RegisterInput, LoginInput, RefreshTokenInput } from './auth.validation';
import { AuthenticatedRequest } from '@middleware/auth.middleware';
import { UserRole } from '@common/enums';
import { getGmailAuthUrl, getGmailTokens } from '@config/gmail.config';
import { BadRequestError } from '@common/errors';

const logger = new Logger('AuthController');

export class AuthController {
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const { name, email, password, role } = req.body as RegisterInput;

      const user = await AuthService.register(name, email, password, role as UserRole | undefined);

      res.status(201).json(
        ResponseBuilder.success(user, 'User registered successfully')
      );
    } catch (error) {
      next(error);
    }
  }

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body as LoginInput;

      const { user, tokens } = await AuthService.login(email, password);

      res.json(
        ResponseBuilder.success(
          { user, ...tokens },
          'Login successful'
        )
      );
    } catch (error) {
      next(error);
    }
  }

  async refreshToken(req: Request, res: Response, next: NextFunction) {
    try {
      const { refreshToken } = req.body as RefreshTokenInput;

      const { accessToken } = await AuthService.refreshAccessToken(refreshToken);

      res.json(
        ResponseBuilder.success(
          { accessToken },
          'Token refreshed successfully'
        )
      );
    } catch (error) {
      next(error);
    }
  }

  async changePassword(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        res.status(401).json(ResponseBuilder.error('Unauthorized'));
        return;
      }

      const { oldPassword, newPassword } = req.body;

      if (!oldPassword || !newPassword) {
        res.status(400).json(
          ResponseBuilder.error('Missing required fields: oldPassword, newPassword')
        );
        return;
      }

      await AuthService.changePassword(req.user.id, oldPassword, newPassword);

      res.json(ResponseBuilder.success({}, 'Password changed successfully'));
    } catch (error) {
      next(error);
    }
  }

  async getProfile(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        res.status(401).json(ResponseBuilder.error('Unauthorized'));
        return;
      }

      const user = await AuthService.getUserById(req.user.id);

      res.json(
        ResponseBuilder.success(user, 'Profile fetched successfully')
      );
    } catch (error) {
      next(error);
    }
  }

  async getGmailAuthUrl(req: Request, res: Response, next: NextFunction) {
    try {
      const authorizationUrl = getGmailAuthUrl();
      res.json(
        ResponseBuilder.success(
          { authorizationUrl },
          'Open this URL in your browser to authorize Gmail access'
        )
      );
    } catch (error) {
      next(error);
    }
  }

  async redirectToGmailAuth(req: Request, res: Response, next: NextFunction) {
    try {
      res.redirect(getGmailAuthUrl());
    } catch (error) {
      next(error);
    }
  }

  async gmailCallback(req: Request, res: Response, next: NextFunction) {
    try {
      const code = req.query.code as string | undefined;

      if (!code) {
        throw new BadRequestError('Missing Gmail OAuth authorization code');
      }

      const tokens = await getGmailTokens(code);
      const refreshToken = tokens.refresh_token;

      logger.info(`[Gmail OAuth] Refresh token: ${refreshToken || 'No refresh token returned'}`);

      res.json(
        ResponseBuilder.success(
          {
            refreshToken,
            accessToken: tokens.access_token,
            expiryDate: tokens.expiry_date,
            envSnippet: refreshToken ? `GMAIL_REFRESH_TOKEN=${refreshToken}` : undefined,
            note: refreshToken
              ? 'Copy envSnippet into your .env file, then restart the backend.'
              : 'Google did not return a refresh token. Revoke app access or keep prompt=consent/access_type=offline and try again.',
          },
          'Gmail OAuth callback handled'
        )
      );
    } catch (error) {
      next(error);
    }
  }
}

export default new AuthController();

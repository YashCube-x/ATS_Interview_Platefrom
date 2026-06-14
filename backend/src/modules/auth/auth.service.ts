import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { User, IUser } from '@database/models/user.model';
import { envConfig } from '@config/env.config';
import { Logger } from '@common/logger';
import {
  UnauthorizedError,
  ConflictError,
  NotFoundError,
  InternalServerError,
} from '@common/errors';
import { UserRole } from '@common/enums';

const logger = new Logger('AuthService');

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface DecodedToken {
  id: string;
  email: string;
  role: UserRole;
}

export class AuthService {
  async register(
    name: string,
    email: string,
    password: string,
    role: UserRole = UserRole.CANDIDATE
  ): Promise<Omit<IUser, 'password'>> {
    try {
      logger.info(`Registering user: ${email}`);

      // Check if user already exists
      const existingUser = await User.findOne({ email: email.toLowerCase() });
      if (existingUser) {
        throw new ConflictError('Email already registered');
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create user
      const user = await User.create({
        name,
        email: email.toLowerCase(),
        password: hashedPassword,
        role,
        isActive: true,
      });

      logger.info(`User registered successfully: ${email}`);

      // Return user without password
      const userObj = user.toObject();
      delete (userObj as any).password;
      return userObj as Omit<IUser, 'password'>;
    } catch (error) {
      logger.error('User registration failed', error);
      throw error;
    }
  }

  async login(email: string, password: string): Promise<{ user: Omit<IUser, 'password'>; tokens: AuthTokens }> {
    try {
      logger.info(`Login attempt for: ${email}`);

      // Find user
      const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
      if (!user) {
        throw new UnauthorizedError('Invalid credentials');
      }

      // Check if user is active
      if (!user.isActive) {
        throw new UnauthorizedError('User account is disabled');
      }

      // Compare password
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        throw new UnauthorizedError('Invalid credentials');
      }

      // Generate tokens
      const tokens = this.generateTokens(user);

      // Update last login
      user.lastLogin = new Date();
      await user.save();

      logger.info(`User logged in successfully: ${email}`);

      // Return user without password
      const userObj = user.toObject();
      delete (userObj as any).password;
      return {
        user: userObj as Omit<IUser, 'password'>,
        tokens,
      };
    } catch (error) {
      logger.error('Login failed', error);
      throw error;
    }
  }

  generateTokens(user: IUser): AuthTokens {
    const payload = {
      id: user._id.toString(),
      email: user.email,
      role: user.role,
    };

    const accessToken = jwt.sign(payload, envConfig.JWT_SECRET, {
      expiresIn: envConfig.JWT_EXPIRY,
      algorithm: 'HS256',
    } as jwt.SignOptions);

    const refreshToken = jwt.sign(payload, envConfig.JWT_REFRESH_SECRET, {
      expiresIn: envConfig.JWT_REFRESH_EXPIRY,
      algorithm: 'HS256',
    } as jwt.SignOptions);

    return { accessToken, refreshToken };
  }

  verifyAccessToken(token: string): DecodedToken {
    try {
      const decoded = jwt.verify(token, envConfig.JWT_SECRET) as DecodedToken;
      return decoded;
    } catch (error) {
      logger.error('Access token verification failed', error);
      throw new UnauthorizedError('Invalid or expired access token');
    }
  }

  verifyRefreshToken(token: string): DecodedToken {
    try {
      const decoded = jwt.verify(token, envConfig.JWT_REFRESH_SECRET) as DecodedToken;
      return decoded;
    } catch (error) {
      logger.error('Refresh token verification failed', error);
      throw new UnauthorizedError('Invalid or expired refresh token');
    }
  }

  async refreshAccessToken(refreshToken: string): Promise<{ accessToken: string }> {
    try {
      const decoded = this.verifyRefreshToken(refreshToken);

      // Get user from database
      const user = await User.findById(decoded.id);
      if (!user) {
        throw new NotFoundError('User not found');
      }

      // Generate new access token
      const accessToken = jwt.sign(
        {
          id: user._id.toString(),
          email: user.email,
          role: user.role,
        },
        envConfig.JWT_SECRET,
        {
          expiresIn: envConfig.JWT_EXPIRY,
          algorithm: 'HS256',
        } as jwt.SignOptions
      );

      logger.info(`Access token refreshed for: ${user.email}`);

      return { accessToken };
    } catch (error) {
      logger.error('Token refresh failed', error);
      throw error;
    }
  }

  async changePassword(userId: string, oldPassword: string, newPassword: string): Promise<void> {
    try {
      logger.info(`Changing password for user: ${userId}`);

      const user = await User.findById(userId).select('+password');
      if (!user) {
        throw new NotFoundError('User not found');
      }

      // Verify old password
      const isPasswordValid = await bcrypt.compare(oldPassword, user.password);
      if (!isPasswordValid) {
        throw new UnauthorizedError('Current password is incorrect');
      }

      // Hash new password
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      user.password = hashedPassword;
      await user.save();

      logger.info(`Password changed successfully for user: ${userId}`);
    } catch (error) {
      logger.error('Password change failed', error);
      throw error;
    }
  }

  async getUserById(userId: string): Promise<Omit<IUser, 'password'>> {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new NotFoundError('User not found');
      }

      const userObj = user.toObject();
      delete (userObj as any).password;
      return userObj as Omit<IUser, 'password'>;
    } catch (error) {
      logger.error('Error fetching user', error);
      throw error;
    }
  }
}

export default new AuthService();

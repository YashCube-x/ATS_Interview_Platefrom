import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { Candidate, ICandidate } from '@database/models/candidate.model';
import { CandidatePortalCredentials } from '@database/models/candidatePortalCredentials.model';
import { Interview } from '@database/models/interview.model';
import { Offer } from '@database/models/offer.model';
import { envConfig } from '@config/env.config';
import { CandidateStatus, UserRole } from '@common/enums';
import { NotFoundError, UnauthorizedError, BadRequestError } from '@common/errors';
import EmailService from '@services/email/email.service';

export class CandidatePortalService {
  async ensureCredentialsForSelectedCandidate(candidate: ICandidate) {
    if (candidate.status !== CandidateStatus.SELECTED) {
      throw new BadRequestError('Candidate must be selected before portal access is enabled');
    }

    const existing = await CandidatePortalCredentials.findOne({ candidateId: candidate._id });
    if (existing) {
      return existing;
    }

    const tempPassword = crypto.randomBytes(9).toString('base64url');
    const credentials = await CandidatePortalCredentials.create({
      candidateId: candidate._id,
      email: candidate.email,
      password: await bcrypt.hash(tempPassword, 10),
      isActive: true,
    });

    await EmailService.sendPortalCredentialsEmail(
      candidate.name,
      candidate.email,
      `${envConfig.FRONTEND_URL}/candidate-portal`,
      tempPassword
    );

    return credentials;
  }

  async login(email: string, password: string) {
    const credentials = await CandidatePortalCredentials.findOne({ email: email.toLowerCase(), isActive: true })
      .select('+password');
    if (!credentials) {
      throw new UnauthorizedError('Invalid portal credentials');
    }

    const isValid = await bcrypt.compare(password, credentials.password);
    if (!isValid) {
      throw new UnauthorizedError('Invalid portal credentials');
    }

    const candidate = await Candidate.findById(credentials.candidateId);
    if (!candidate || candidate.status !== CandidateStatus.SELECTED) {
      throw new UnauthorizedError('Candidate portal is not enabled');
    }

    credentials.lastLogin = new Date();
    await credentials.save();

    const token = jwt.sign(
      { id: candidate._id.toString(), email: candidate.email, role: UserRole.CANDIDATE },
      envConfig.JWT_SECRET,
      { expiresIn: envConfig.JWT_EXPIRY, algorithm: 'HS256' } as jwt.SignOptions
    );

    return { candidate, token };
  }

  async getProfile(candidateId: string) {
    const candidate = await Candidate.findById(candidateId);
    if (!candidate) {
      throw new NotFoundError('Candidate not found');
    }
    return candidate;
  }

  async getStatus(candidateId: string) {
    const candidate = await this.getProfile(candidateId);
    const interviews = await Interview.find({ candidateId }).sort({ scheduledDate: 1 });
    const offers = await Offer.find({ candidateId }).sort({ createdAt: -1 });

    return {
      applicationStatus: candidate.status,
      selectedAt: candidate.selectedAt,
      interviews,
      offers,
      onboarding: {
        enabled: candidate.status === CandidateStatus.SELECTED || candidate.status === CandidateStatus.ONBOARDING,
        notes: candidate.notes,
      },
    };
  }

  async requestPasswordReset(email: string) {
    const credentials = await CandidatePortalCredentials.findOne({ email: email.toLowerCase(), isActive: true });
    if (!credentials) {
      return;
    }

    const token = crypto.randomBytes(32).toString('hex');
    credentials.passwordResetToken = token;
    credentials.passwordResetExpiry = new Date(Date.now() + 1000 * 60 * 30);
    await credentials.save();

    await EmailService.sendEmail({
      to: email,
      subject: 'Candidate Portal Password Reset',
      html: `<p>Use this reset token to update your password: <strong>${token}</strong></p>`,
    });
  }

  async resetPassword(token: string, password: string) {
    const credentials = await CandidatePortalCredentials.findOne({
      passwordResetToken: token,
      passwordResetExpiry: { $gt: new Date() },
    }).select('+password');

    if (!credentials) {
      throw new BadRequestError('Invalid or expired password reset token');
    }

    credentials.password = await bcrypt.hash(password, 10);
    credentials.passwordResetToken = undefined;
    credentials.passwordResetExpiry = undefined;
    await credentials.save();
  }
}

export default new CandidatePortalService();

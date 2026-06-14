import { CandidateStatus } from '@common/enums';
import EmailService from '@services/email/email.service';

export class NotificationService {
  async notifyCandidateStatusChange(candidate: { name: string; email: string }, status: CandidateStatus, jobTitle = 'the role') {
    if (status === CandidateStatus.SHORTLISTED) {
      return EmailService.sendCandidateShortlistEmail(candidate.name, candidate.email, jobTitle, 'Our recruiting team will contact you with the next steps.');
    }

    if (status === CandidateStatus.REJECTED) {
      return EmailService.sendCandidateRejectionEmail(candidate.name, candidate.email, jobTitle);
    }

    return null;
  }
}

export default new NotificationService();

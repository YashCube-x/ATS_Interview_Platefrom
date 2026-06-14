import nodemailer from 'nodemailer';
import { Logger } from '@common/logger';
import { envConfig } from '@config/env.config';

const logger = new Logger('EmailService');

export interface EmailOptions {
  to: string | string[];
  subject: string;
  html?: string;
  text?: string;
  attachments?: Array<{
    filename: string;
    content?: string;
    path?: string;
  }>;
}

export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: envConfig.SMTP_HOST,
      port: envConfig.SMTP_PORT,
      secure: envConfig.SMTP_PORT === 465,
      auth: {
        user: envConfig.SMTP_USER,
        pass: envConfig.SMTP_PASS,
      },
    });
  }

  async sendEmail(options: EmailOptions): Promise<any> {
    try {
      logger.info(`Sending email to ${options.to}...`);

      const mailOptions = {
        from: envConfig.EMAIL_FROM,
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text,
        attachments: options.attachments,
      };

      const result = await this.transporter.sendMail(mailOptions);
      logger.info(`Email sent successfully: ${result.messageId}`);

      return result;
    } catch (error) {
      logger.error('Failed to send email', error);
      throw error;
    }
  }

  async sendCandidateShortlistEmail(
    candidateName: string,
    candidateEmail: string,
    jobTitle: string,
    nextSteps: string
  ): Promise<any> {
    const html = `
      <h2>Great News, ${candidateName}!</h2>
      <p>We are pleased to inform you that you have been shortlisted for the position of <strong>${jobTitle}</strong>.</p>
      <p>Your application has impressed our hiring team, and we would like to move forward with your candidacy.</p>
      <h3>Next Steps:</h3>
      <p>${nextSteps}</p>
      <p>If you have any questions, feel free to reach out to us.</p>
      <p>Best regards,<br/>ATS Team</p>
    `;

    return this.sendEmail({
      to: candidateEmail,
      subject: `Shortlist Notification - ${jobTitle} Position`,
      html,
    });
  }

  async sendCandidateRejectionEmail(
    candidateName: string,
    candidateEmail: string,
    jobTitle: string
  ): Promise<any> {
    const html = `
      <h2>Application Status Update - ${jobTitle}</h2>
      <p>Dear ${candidateName},</p>
      <p>Thank you for your interest in the ${jobTitle} position and for taking the time to apply with us.</p>
      <p>After careful consideration of your application, we regret to inform you that we have decided to move forward with other candidates whose experience more closely aligns with our current needs.</p>
      <p>We encourage you to apply for other positions at our company in the future.</p>
      <p>Best regards,<br/>ATS Team</p>
    `;

    return this.sendEmail({
      to: candidateEmail,
      subject: `Application Update - ${jobTitle} Position`,
      html,
    });
  }

  async sendInterviewScheduledEmail(
    candidateName: string,
    candidateEmail: string,
    jobTitle: string,
    interviewDate: Date,
    interviewTime: string,
    meetingLink?: string,
    location?: string
  ): Promise<any> {
    const html = `
      <h2>Interview Scheduled - ${jobTitle}</h2>
      <p>Dear ${candidateName},</p>
      <p>Congratulations! Your interview for the ${jobTitle} position has been scheduled.</p>
      <h3>Interview Details:</h3>
      <p><strong>Date:</strong> ${interviewDate.toLocaleDateString()}</p>
      <p><strong>Time:</strong> ${interviewTime}</p>
      ${meetingLink ? `<p><strong>Meeting Link:</strong> <a href="${meetingLink}">${meetingLink}</a></p>` : ''}
      ${location ? `<p><strong>Location:</strong> ${location}</p>` : ''}
      <p>Please confirm your attendance at your earliest convenience.</p>
      <p>Best regards,<br/>ATS Team</p>
    `;

    return this.sendEmail({
      to: candidateEmail,
      subject: `Interview Scheduled - ${jobTitle} Position`,
      html,
    });
  }

  async sendPortalCredentialsEmail(
    candidateName: string,
    candidateEmail: string,
    portalUrl: string,
    tempPassword: string
  ): Promise<any> {
    const html = `
      <h2>Welcome to the Candidate Portal, ${candidateName}!</h2>
      <p>You have been selected and invited to access our candidate portal.</p>
      <h3>Portal Credentials:</h3>
      <p><strong>Portal URL:</strong> <a href="${portalUrl}">${portalUrl}</a></p>
      <p><strong>Email:</strong> ${candidateEmail}</p>
      <p><strong>Temporary Password:</strong> ${tempPassword}</p>
      <p>Please log in and change your password immediately for security.</p>
      <p>In the portal, you can:</p>
      <ul>
        <li>View your interview schedule</li>
        <li>Check offer details</li>
        <li>Complete onboarding tasks</li>
        <li>Access important documents</li>
      </ul>
      <p>If you have any questions, contact us at ${envConfig.EMAIL_SUPPORT}.</p>
      <p>Best regards,<br/>ATS Team</p>
    `;

    return this.sendEmail({
      to: candidateEmail,
      subject: 'Candidate Portal Access - Your Login Credentials',
      html,
    });
  }

  async sendInterviewerNotificationEmail(
    interviewerName: string,
    interviewerEmail: string,
    candidateName: string,
    candidateEmail: string,
    jobTitle: string,
    scheduledDate: Date,
    meetingLink: string
  ): Promise<any> {
    const html = `
      <h2>Interview Assignment - ${jobTitle}</h2>
      <p>Dear ${interviewerName},</p>
      <p>You have been assigned to conduct an interview for the <strong>${jobTitle}</strong> position.</p>
      <h3>Candidate Details:</h3>
      <ul>
        <li><strong>Name:</strong> ${candidateName}</li>
        <li><strong>Email:</strong> ${candidateEmail}</li>
      </ul>
      <h3>Interview Schedule:</h3>
      <ul>
        <li><strong>Date & Time:</strong> ${new Date(scheduledDate).toLocaleString()}</li>
        <li><strong>Google Meet Link:</strong> <a href="${meetingLink}">${meetingLink}</a></li>
      </ul>
      <p>Please make sure to join on time and update the candidate's feedback in the ATS portal after the interview.</p>
      <p>Best regards,<br/>ATS Team</p>
    `;

    return this.sendEmail({
      to: interviewerEmail,
      subject: `Assigned Interview: ${candidateName} for ${jobTitle}`,
      html,
    });
  }

  async sendHRNotificationEmail(
    hrEmail: string,
    interviewerName: string,
    candidateName: string,
    jobTitle: string,
    scheduledDate: Date,
    meetingLink: string
  ): Promise<any> {
    const html = `
      <h2>Interview Scheduled Confirmation</h2>
      <p>Hello HR Team,</p>
      <p>An interview has been scheduled successfully for <strong>${candidateName}</strong> for the <strong>${jobTitle}</strong> position.</p>
      <h3>Interview Details:</h3>
      <ul>
        <li><strong>Interviewer:</strong> ${interviewerName}</li>
        <li><strong>Date & Time:</strong> ${new Date(scheduledDate).toLocaleString()}</li>
        <li><strong>Google Meet Link:</strong> <a href="${meetingLink}">${meetingLink}</a></li>
      </ul>
      <p>The candidate and interviewer have been notified with the calendar invite and details.</p>
      <p>Best regards,<br/>ATS Team</p>
    `;

    return this.sendEmail({
      to: hrEmail,
      subject: `Confirmed Interview: ${candidateName} for ${jobTitle}`,
      html,
    });
  }

  async verifyConnection(): Promise<boolean> {
    try {
      await this.transporter.verify();
      logger.info('Email transporter verified successfully');
      return true;
    } catch (error) {
      logger.error('Email transporter verification failed', error);
      return false;
    }
  }
}

export default new EmailService();

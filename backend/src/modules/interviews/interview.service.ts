import { Interview, IInterview } from '@database/models/interview.model';
import { Candidate } from '@database/models/candidate.model';
import { Job } from '@database/models/job.model';
import GoogleCalendarService from '@services/googleCalendar/calendar.service';
import EmailService from '@services/email/email.service';
import { envConfig } from '@config/env.config';
import { NotFoundError } from '@common/errors';
import { Logger } from '@common/logger';

const logger = new Logger('InterviewService');

export class InterviewService {
  async create(data: Partial<IInterview>): Promise<IInterview> {
    logger.info(`Creating interview for candidate ${data.candidateId}`);

    // 1. Fetch Candidate and Job details
    const candidate = await Candidate.findById(data.candidateId);
    if (!candidate) {
      throw new NotFoundError('Candidate not found');
    }

    const job = await Job.findById(data.jobId);
    if (!job) {
      throw new NotFoundError('Job not found');
    }

    const scheduledDate = data.scheduledDate ? new Date(data.scheduledDate) : new Date();

    let hangoutLink = '';
    let calendarEventId = '';

    // 2. Call Google Calendar Service to create event and get Meet link
    if (data.interviewerEmail && data.interviewerName) {
      try {
        const calResult = await GoogleCalendarService.createInterviewEvent({
          candidateName: candidate.name,
          candidateEmail: candidate.email,
          interviewerName: data.interviewerName,
          interviewerEmail: data.interviewerEmail,
          jobTitle: job.title,
          scheduledDate,
          durationMinutes: data.duration || 45,
        });
        hangoutLink = calResult.hangoutLink;
        calendarEventId = calResult.calendarEventId;
      } catch (error) {
        logger.error('Failed to create calendar event, continuing with mock link creation', error);
        const letters = 'abcdefghijklmnopqrstuvwxyz';
        const randStr = (len: number) => Array.from({ length: len }, () => letters[Math.floor(Math.random() * letters.length)]).join('');
        const mockCode = `${randStr(3)}-${randStr(4)}-${randStr(3)}`;
        hangoutLink = `https://meet.google.com/${mockCode}`;
      }
    } else {
      // Fallback if no interviewer is assigned
      const letters = 'abcdefghijklmnopqrstuvwxyz';
      const randStr = (len: number) => Array.from({ length: len }, () => letters[Math.floor(Math.random() * letters.length)]).join('');
      const mockCode = `${randStr(3)}-${randStr(4)}-${randStr(3)}`;
      hangoutLink = `https://meet.google.com/${mockCode}`;
    }

    // 3. Set the generated Google Meet link
    data.meetingLink = hangoutLink;
    if (calendarEventId) {
      data.notes = `${data.notes || ''}\nGoogle Calendar Event ID: ${calendarEventId}`.trim();
    }

    // 4. Create interview record in database
    const interview = await Interview.create(data);

    // 5. Send Email notifications in background
    if (data.interviewerEmail && data.interviewerName && hangoutLink) {
      // Notify Interviewer
      EmailService.sendInterviewerNotificationEmail(
        data.interviewerName,
        data.interviewerEmail,
        candidate.name,
        candidate.email,
        job.title,
        scheduledDate,
        hangoutLink
      ).catch(err => logger.error('Failed to send email to interviewer', err));

      // Notify HR (using support/from email as HR email)
      const hrEmail = envConfig.GMAIL_USER_EMAIL || envConfig.EMAIL_SUPPORT || 'hr@ats.com';
      EmailService.sendHRNotificationEmail(
        hrEmail,
        data.interviewerName,
        candidate.name,
        job.title,
        scheduledDate,
        hangoutLink
      ).catch(err => logger.error('Failed to send email to HR', err));

      // Notify Candidate
      const timeString = scheduledDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      EmailService.sendInterviewScheduledEmail(
        candidate.name,
        candidate.email,
        job.title,
        scheduledDate,
        timeString,
        hangoutLink
      ).catch(err => logger.error('Failed to send email to candidate', err));
    }

    return interview;
  }

  async getById(id: string): Promise<IInterview> {
    const interview = await Interview.findById(id)
      .populate('candidateId', 'name email')
      .populate('jobId', 'title');
    if (!interview) {
      throw new NotFoundError('Interview not found');
    }
    return interview;
  }

  async list(filters: { candidateId?: string; jobId?: string; status?: string } = {}): Promise<IInterview[]> {
    const query: any = {};
    if (filters.candidateId) query.candidateId = filters.candidateId;
    if (filters.jobId) query.jobId = filters.jobId;
    if (filters.status) query.status = filters.status;

    return Interview.find(query)
      .populate('candidateId', 'name email')
      .populate('jobId', 'title')
      .sort({ scheduledDate: 1 });
  }

  async update(id: string, data: Partial<IInterview>): Promise<IInterview> {
    const interview = await Interview.findByIdAndUpdate(id, data, { new: true })
      .populate('candidateId', 'name email')
      .populate('jobId', 'title');
    if (!interview) {
      throw new NotFoundError('Interview not found');
    }
    return interview;
  }

  async delete(id: string): Promise<void> {
    logger.info(`Deleting interview ${id}`);
    const interview = await Interview.findById(id);
    if (!interview) {
      throw new NotFoundError('Interview not found');
    }

    // Try to extract Google Calendar Event ID from notes
    const match = interview.notes?.match(/Google Calendar Event ID:\s*(\S+)/);
    if (match && match[1]) {
      const calendarEventId = match[1];
      await GoogleCalendarService.deleteInterviewEvent(calendarEventId);
    }

    await Interview.findByIdAndDelete(id);
    logger.info(`Interview ${id} deleted successfully`);
  }
}

export default new InterviewService();

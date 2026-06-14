import { google } from 'googleapis';
import { createGmailClient } from '@config/gmail.config';
import { Logger } from '@common/logger';

const logger = new Logger('GoogleCalendarService');

export interface CreateEventParams {
  candidateName: string;
  candidateEmail: string;
  interviewerName: string;
  interviewerEmail: string;
  jobTitle: string;
  scheduledDate: Date;
  durationMinutes?: number;
}

export class GoogleCalendarService {
  private getCalendarClient() {
    try {
      const oauth2Client = createGmailClient();
      return google.calendar({ version: 'v3', auth: oauth2Client });
    } catch (error) {
      logger.error('Failed to initialize Google Calendar client', error);
      throw error;
    }
  }

  async createInterviewEvent(params: CreateEventParams): Promise<{ hangoutLink: string; calendarEventId: string }> {
    const {
      candidateName,
      candidateEmail,
      interviewerName,
      interviewerEmail,
      jobTitle,
      scheduledDate,
      durationMinutes = 45,
    } = params;

    try {
      logger.info(`Creating Google Calendar event for candidate: ${candidateName}`);
      const calendar = this.getCalendarClient();

      const startTime = new Date(scheduledDate);
      const endTime = new Date(startTime.getTime() + durationMinutes * 60 * 1000);

      const eventBody = {
        summary: `Technical Interview: ${candidateName} for ${jobTitle}`,
        description: `Technical interview round for ${candidateName} applying for the ${jobTitle} position.\nInterviewer: ${interviewerName}`,
        start: {
          dateTime: startTime.toISOString(),
          timeZone: 'UTC',
        },
        end: {
          dateTime: endTime.toISOString(),
          timeZone: 'UTC',
        },
        attendees: [
          { email: candidateEmail, displayName: candidateName },
          { email: interviewerEmail, displayName: interviewerName },
        ],
        conferenceData: {
          createRequest: {
            requestId: `interview-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
            conferenceSolutionKey: {
              type: 'hangoutsMeet',
            },
          },
        },
        reminders: {
          useDefault: false,
          overrides: [
            { method: 'email', minutes: 24 * 60 }, // 1 day before
            { method: 'email', minutes: 60 },      // 1 hour before
            { method: 'popup', minutes: 15 },      // 15 mins before
          ],
        },
      };

      const response = await calendar.events.insert({
        calendarId: 'primary',
        requestBody: eventBody,
        conferenceDataVersion: 1,
        sendUpdates: 'all', // This will automatically invite/notify attendees on Google Calendar
      });

      const eventData = response.data;
      const hangoutLink = eventData.hangoutLink || '';
      const calendarEventId = eventData.id || '';

      if (!hangoutLink) {
        logger.warn('Event created successfully, but no Google Meet (hangoutLink) was generated.');
      } else {
        logger.info(`Event created successfully. Google Meet link: ${hangoutLink}`);
      }

      return {
        hangoutLink,
        calendarEventId,
      };
    } catch (error) {
      logger.error('Failed to create Google Calendar event', error);
      throw error;
    }
  }

  async deleteInterviewEvent(calendarEventId: string): Promise<void> {
    try {
      logger.info(`Deleting Google Calendar event: ${calendarEventId}`);
      const calendar = this.getCalendarClient();
      await calendar.events.delete({
        calendarId: 'primary',
        eventId: calendarEventId,
      });
      logger.info(`Google Calendar event deleted successfully: ${calendarEventId}`);
    } catch (error) {
      logger.error(`Failed to delete Google Calendar event: ${calendarEventId}`, error);
    }
  }
}

export default new GoogleCalendarService();

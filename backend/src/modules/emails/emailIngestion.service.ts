import GmailService from '@services/gmail/gmail.service';
import ResumeService from '@modules/resumes/resume.service';
import GeminiService from '@services/gemini/gemini.service';
import { ResumeSource } from '@common/enums';
import { Logger } from '@common/logger';

const logger = new Logger('EmailIngestionService');

export class EmailIngestionService {
  async ingestLatestResumes(maxResults = 10) {
    const messages = await GmailService.listResumeMessages(undefined, maxResults);
    const processed = [];

    for (const message of messages) {
      if (!message.id) {
        continue;
      }

      try {
        // Fetch full message details, body, and attachments
        const emailDetails = await GmailService.getFullMessageDetails(message.id);
        
        // Classify e-mail content to filter spam/fraud
        const classification = await GeminiService.classifyEmail({
          subject: emailDetails.subject,
          from: emailDetails.from,
          body: emailDetails.body,
        });

        // Skip if classified as SPAM or FRAUD
        if (classification !== 'APPLICATION') {
          logger.info(`Skipping email ${message.id} (classified as ${classification})`);
          // Still mark as read so we don't process it again next time
          await GmailService.markAsRead(message.id);
          continue;
        }

        // Process attachments for valid candidate applications
        for (const attachment of emailDetails.attachments) {
          if (!/\.(pdf|docx|txt|text)$/i.test(attachment.fileName)) {
            continue;
          }

          logger.info(`Processing resume attachment: ${attachment.fileName}`);
          processed.push(await ResumeService.uploadAndParseResume(
            attachment.buffer,
            attachment.fileName,
            ResumeSource.EMAIL
          ));
        }

        // Mark email as read so it won't be processed again
        await GmailService.markAsRead(message.id);
      } catch (error) {
        logger.error(`Error processing email ${message.id}`, error);
      }
    }

    return processed;
  }
}

export default new EmailIngestionService();

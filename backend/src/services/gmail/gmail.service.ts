import { createGmailService } from '@config/gmail.config';
import { Logger } from '@common/logger';

const logger = new Logger('GmailService');

export interface GmailAttachment {
  fileName: string;
  mimeType: string;
  buffer: Buffer;
}

export class GmailService {
  async listResumeMessages(
    query = 'is:unread has:attachment filename:(pdf OR docx OR txt) category:primary -category:promotions -category:social -category:updates -category:forums (resume OR cv OR "job application" OR "applying" OR subject:(apply OR application OR candidate OR resume OR cv))',
    maxResults = 10
  ) {
    const gmail = createGmailService();
    const response = await gmail.users.messages.list({
      userId: 'me',
      q: query,
      maxResults,
    });

    return response.data.messages || [];
  }

  async markAsRead(messageId: string): Promise<void> {
    try {
      const gmail = createGmailService();
      await gmail.users.messages.modify({
        userId: 'me',
        id: messageId,
        requestBody: {
          removeLabelIds: ['UNREAD'],
        },
      });
      logger.info(`Message ${messageId} successfully marked as read`);
    } catch (error) {
      logger.error(`Failed to mark message ${messageId} as read`, error);
      throw error;
    }
  }

  async getAttachments(messageId: string): Promise<GmailAttachment[]> {
    const gmail = createGmailService();
    const message = await gmail.users.messages.get({
      userId: 'me',
      id: messageId,
    });

    const parts = message.data.payload?.parts || [];
    const attachments: GmailAttachment[] = [];

    for (const part of parts) {
      if (!part.filename || !part.body?.attachmentId) {
        continue;
      }

      const attachment = await gmail.users.messages.attachments.get({
        userId: 'me',
        messageId,
        id: part.body.attachmentId as string,
      });

      const base64 = attachment.data.data?.replace(/-/g, '+').replace(/_/g, '/');
      if (!base64) {
        continue;
      }

      attachments.push({
        fileName: part.filename,
        mimeType: part.mimeType || 'application/octet-stream',
        buffer: Buffer.from(base64, 'base64'),
      });
    }

    logger.info(`Extracted ${attachments.length} attachments from Gmail message ${messageId}`);
    return attachments;
  }

  async getFullMessageDetails(messageId: string): Promise<{
    subject: string;
    from: string;
    body: string;
    attachments: GmailAttachment[];
  }> {
    const gmail = createGmailService();
    const message = await gmail.users.messages.get({
      userId: 'me',
      id: messageId,
    });

    const headers = message.data.payload?.headers || [];
    const subject = headers.find(h => h.name?.toLowerCase() === 'subject')?.value || '';
    const from = headers.find(h => h.name?.toLowerCase() === 'from')?.value || '';
    const snippet = message.data.snippet || '';

    // Extract body text recursively
    let body = '';
    const parts = message.data.payload?.parts || [];
    
    const findTextBody = (partsList: any[]): string => {
      for (const p of partsList) {
        if (p.mimeType === 'text/plain' && p.body?.data) {
          return Buffer.from(p.body.data, 'base64').toString('utf-8');
        }
        if (p.parts) {
          const result = findTextBody(p.parts);
          if (result) return result;
        }
      }
      return '';
    };

    body = findTextBody(parts) || snippet;

    // Extract attachments recursively
    const attachments: GmailAttachment[] = [];
    const extractAttachments = async (partsList: any[]) => {
      for (const part of partsList) {
        if (part.filename && part.body?.attachmentId) {
          const attachment = await gmail.users.messages.attachments.get({
            userId: 'me',
            messageId,
            id: part.body.attachmentId as string,
          });

          const base64 = attachment.data.data?.replace(/-/g, '+').replace(/_/g, '/');
          if (base64) {
            attachments.push({
              fileName: part.filename,
              mimeType: part.mimeType || 'application/octet-stream',
              buffer: Buffer.from(base64, 'base64'),
            });
          }
        }
        if (part.parts) {
          await extractAttachments(part.parts);
        }
      }
    };

    const payload = message.data.payload;
    if (parts.length > 0) {
      await extractAttachments(parts);
    } else if (payload?.body?.attachmentId) {
      const attachment = await gmail.users.messages.attachments.get({
        userId: 'me',
        messageId,
        id: payload.body.attachmentId as string,
      });
      const base64 = attachment.data.data?.replace(/-/g, '+').replace(/_/g, '/');
      if (base64) {
        attachments.push({
          fileName: payload.filename || 'attachment',
          mimeType: payload.mimeType || 'application/octet-stream',
          buffer: Buffer.from(base64, 'base64'),
        });
      }
    }

    logger.info(`Fetched details & ${attachments.length} attachments for message ${messageId}`);
    return {
      subject,
      from,
      body,
      attachments,
    };
  }
}

export default new GmailService();

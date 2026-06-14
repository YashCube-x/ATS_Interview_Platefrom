import { google } from 'googleapis';
import { Logger } from '@common/logger';
import { envConfig } from './env.config';
import { BadRequestError } from '@common/errors';

const logger = new Logger('GmailConfig');

export interface GmailOAuthTokens {
  access_token?: string | null;
  refresh_token?: string | null;
  scope?: string;
  token_type?: string | null;
  expiry_date?: number | null;
}

export const createGmailClient = () => {
  try {
    if (
      !envConfig.GMAIL_CLIENT_ID ||
      !envConfig.GMAIL_CLIENT_SECRET ||
      !envConfig.GMAIL_REFRESH_TOKEN ||
      !envConfig.GMAIL_REDIRECT_URI
    ) {
      throw new BadRequestError(
        'Gmail API is not configured. Set GMAIL_CLIENT_ID, GMAIL_CLIENT_SECRET, GMAIL_REFRESH_TOKEN, and GMAIL_REDIRECT_URI to use email resume ingestion.'
      );
    }

    const oauth2Client = new google.auth.OAuth2(
      envConfig.GMAIL_CLIENT_ID,
      envConfig.GMAIL_CLIENT_SECRET,
      envConfig.GMAIL_REDIRECT_URI
    );

    oauth2Client.setCredentials({
      refresh_token: envConfig.GMAIL_REFRESH_TOKEN,
    });

    logger.info('Gmail OAuth2 client created successfully');
    return oauth2Client;
  } catch (error) {
    logger.error('Failed to create Gmail OAuth2 client', error);
    throw error;
  }
};

export const createGmailService = () => {
  const oauth2Client = createGmailClient();
  return google.gmail({ version: 'v1', auth: oauth2Client });
};

export const getGmailAuthUrl = (): string => {
  if (!envConfig.GMAIL_CLIENT_ID || !envConfig.GMAIL_CLIENT_SECRET || !envConfig.GMAIL_REDIRECT_URI) {
    throw new BadRequestError(
      'Gmail OAuth is not configured. Set GMAIL_CLIENT_ID, GMAIL_CLIENT_SECRET, and GMAIL_REDIRECT_URI.'
    );
  }

  const oauth2Client = new google.auth.OAuth2(
    envConfig.GMAIL_CLIENT_ID,
    envConfig.GMAIL_CLIENT_SECRET,
    envConfig.GMAIL_REDIRECT_URI
  );

  const scopes = [
    'https://www.googleapis.com/auth/gmail.readonly',
    'https://www.googleapis.com/auth/gmail.modify',
    'https://www.googleapis.com/auth/calendar',
    'https://www.googleapis.com/auth/calendar.events',
  ];

  return oauth2Client.generateAuthUrl({
    access_type: 'offline',
    prompt: 'consent',
    scope: scopes,
  });
};

export const getGmailTokens = async (code: string): Promise<GmailOAuthTokens> => {
  if (!envConfig.GMAIL_CLIENT_ID || !envConfig.GMAIL_CLIENT_SECRET || !envConfig.GMAIL_REDIRECT_URI) {
    throw new BadRequestError(
      'Gmail OAuth is not configured. Set GMAIL_CLIENT_ID, GMAIL_CLIENT_SECRET, and GMAIL_REDIRECT_URI.'
    );
  }

  const oauth2Client = new google.auth.OAuth2(
    envConfig.GMAIL_CLIENT_ID,
    envConfig.GMAIL_CLIENT_SECRET,
    envConfig.GMAIL_REDIRECT_URI
  );

  const { tokens } = await oauth2Client.getToken(code);
  return tokens;
};

export default {
  createGmailClient,
  createGmailService,
  getGmailAuthUrl,
  getGmailTokens,
};

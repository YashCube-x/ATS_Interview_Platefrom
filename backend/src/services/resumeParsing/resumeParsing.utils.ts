import pdf from 'pdf-parse';
import mammoth from 'mammoth';
import { Logger } from '@common/logger';
import { BadRequestError } from '@common/errors';

const logger = new Logger('ResumeParsingUtils');

export class ResumeParsingUtils {
  async extractTextFromPDF(fileBuffer: Buffer): Promise<string> {
    try {
      logger.info('Extracting text from PDF...');

      const data = await pdf(fileBuffer);
      const text = data.text;

      if (!text || text.trim().length === 0) {
        throw new Error('PDF contains no readable text');
      }

      logger.info(`Extracted ${text.length} characters from PDF`);
      return text;
    } catch (error) {
      logger.error('PDF extraction failed', error);
      throw new BadRequestError('Failed to extract text from PDF');
    }
  }

  async extractTextFromDOCX(fileBuffer: Buffer): Promise<string> {
    try {
      logger.info('Extracting text from DOCX...');

      const result = await mammoth.extractRawText({ buffer: fileBuffer });
      const text = result.value;

      if (!text || text.trim().length === 0) {
        throw new Error('DOCX contains no readable text');
      }

      logger.info(`Extracted ${text.length} characters from DOCX`);
      return text;
    } catch (error) {
      logger.error('DOCX extraction failed', error);
      throw new BadRequestError('Failed to extract text from DOCX');
    }
  }

  async extractTextFromResume(
    fileBuffer: Buffer,
    fileName: string
  ): Promise<string> {
    const extension = fileName.split('.').pop()?.toLowerCase();

    logger.info(`Extracting text from resume: ${fileName} (${extension})`);

    switch (extension) {
      case 'pdf':
        return this.extractTextFromPDF(fileBuffer);
      case 'docx':
        return this.extractTextFromDOCX(fileBuffer);
      case 'txt':
      case 'text':
        return fileBuffer.toString('utf-8');
      default:
        throw new BadRequestError(`Unsupported file format: ${extension}`);
    }
  }

  normalizeText(text: string): string {
    return text
      .replace(/\r\n/g, '\n') // Normalize line endings
      .replace(/\s+/g, ' ') // Normalize spaces
      .trim();
  }

  extractEmails(text: string): string[] {
    const emailRegex = /[a-zA-Z0-9._%-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
    return [...new Set(text.match(emailRegex) || [])];
  }

  extractPhoneNumbers(text: string): string[] {
    const phoneRegex = /(\+?\d{1,3}[-.\s]?)?\d{3,4}[-.\s]?\d{3,4}[-.\s]?\d{4}/g;
    return [...new Set(text.match(phoneRegex) || [])];
  }

  extractSkills(text: string, commonSkills: string[] = []): string[] {
    const textLower = text.toLowerCase();
    const foundSkills: string[] = [];

    for (const skill of commonSkills) {
      if (textLower.includes(skill.toLowerCase())) {
        foundSkills.push(skill);
      }
    }

    return [...new Set(foundSkills)];
  }

  extractYearsOfExperience(text: string): number {
    const patterns = [
      /(\d+)\s*years?\s*of\s*experience/gi,
      /(\d+)\s*yoe/gi,
      /(\d+)\+\s*years/gi,
    ];

    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match && match[0]) {
        const numbers = match[0].match(/\d+/);
        if (numbers) {
          return parseInt(numbers[0], 10);
        }
      }
    }

    // Try to estimate from dates
    const datePattern = /(\d{4})\s*[-–]\s*(?:(\d{4})|present|now|current)/gi;
    let maxDuration = 0;

    let dateMatch;
    while ((dateMatch = datePattern.exec(text)) !== null) {
      const startYear = parseInt(dateMatch[1], 10);
      const endYear = dateMatch[2] ? parseInt(dateMatch[2], 10) : new Date().getFullYear();
      const duration = endYear - startYear;
      maxDuration = Math.max(maxDuration, duration);
    }

    return maxDuration;
  }
}

export default new ResumeParsingUtils();

import path = require('path');
module.paths.unshift(path.join(__dirname, '../backend/node_modules'));

const pdf = require('pdf-parse');
const mammoth = require('mammoth');

const logger = {
    info: (msg: string) => console.log(`[INFO] [ResumeParsingUtils]: ${msg}`),
    error: (msg: string, err: any) => console.error(`[ERROR] [ResumeParsingUtils]: ${msg}`, err)
};

export class ResumeParsingUtils {

    async extractTextFromPDF(fileBuffer: Buffer): Promise<string> {
        try {
            logger.info('Extracting text from PDF...');

            const data = await pdf(fileBuffer);
            const text = data.text;

            if (!text || !text.trim()) {
                throw new Error('PDF contains no readable text');
            }

            logger.info(`Extracted ${text.length} characters from PDF`);
            return this.normalizeText(text);
        } catch (error) {
            logger.error('PDF extraction failed', error);
            throw new Error('Failed to extract text from PDF');
        }
    }

    async extractTextFromDOCX(fileBuffer: Buffer): Promise<string> {
        try {
            logger.info('Extracting text from DOCX...');
            const result = await mammoth.extractRawText({ buffer: fileBuffer });
            const text = result.value;

            if (!text || !text.trim()) {
                throw new Error('DOCX contains no readable text');
            }

            logger.info(`Extracted ${text.length} characters from DOCX`);
            return this.normalizeText(text);
        } catch (error) {
            logger.error('DOCX extraction failed', error);
            throw new Error('Failed to extract text from DOCX');
        }
    }

    async extractTextFromResume(fileBuffer: Buffer, fileName: string): Promise<string> {
        const extension = fileName.split('.').pop()?.toLowerCase();
        logger.info(`Extracting text from resume: ${fileName} (${extension})`);

        switch (extension) {
            case 'pdf':
                return this.extractTextFromPDF(fileBuffer);
            case 'docx':
                return this.extractTextFromDOCX(fileBuffer);
            case 'txt':
            case 'text':
                return this.normalizeText(fileBuffer.toString('utf-8'));
            default:
                throw new Error(`Unsupported file format: ${extension}`);
        }
    }

    normalizeText(text: string): string {
        return text
            .replace(/\r\n|\r/g, '\n')
            .replace(/[ \t]+/g, ' ')
            .replace(/\n\s*\n/g, '\n')
            .trim();
    }

    extractEmails(text: string): string[] {
        const emailRegex = /[a-zA-Z0-9._%-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
        const matches = text.match(emailRegex);
        return matches ? Array.from(new Set(matches.map(email => email.toLowerCase()))) : [];
    }

    extractPhoneNumbers(text: string): string[] {
        const phoneRegex = /(\+?\d{1,3}[-.\s]?)?\(?\d{3,4}\)?[-.\s]?\d{3,4}[-.\s]?\d{4}/g;
        const matches = text.match(phoneRegex);
        return matches ? Array.from(new Set(matches.map(num => num.trim()))) : [];
    }

    extractSkills(text: string, commonSkills: string[] = []): string[] {
        const escapeRegExp = (str: string) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

        return commonSkills.filter(skill => {
            const escapedSkill = escapeRegExp(skill);
            const regex = new RegExp(`(?:^|\\s|\\b)${escapedSkill}(?:\\s|\\b|$|,)`, 'i');
            return regex.test(text);
        });
    }

    extractYearsOfExperience(text: string): number {
        const patterns = [
            /(\d+)\s*years?\s*of\s*experience/i,
            /(\d+)\s*yoe/i,
            /(\d+)\+\s*years/i,
        ];

        for (const pattern of patterns) {
            const match = pattern.exec(text);
            if (match && match[1]) {
                return parseInt(match[1], 10);
            }
        }

        const datePattern = /(\d{4})\s*[-–—]\s*(?:(\d{4})|present|now|current)/gi;
        let maxDuration = 0;
        let dateMatch;

        while ((dateMatch = datePattern.exec(text)) !== null) {
            const startYear = parseInt(dateMatch[1], 10);
            const endYear = dateMatch[2] ? parseInt(dateMatch[2], 10) : new Date().getFullYear();

            if (startYear > 1970 && endYear >= startYear && startYear <= new Date().getFullYear()) {
                const duration = endYear - startYear;
                maxDuration = Math.max(maxDuration, duration);
            }
        }

        return maxDuration;
    }

    async parseResumeWithAI(resumeText: string): Promise<any> {
        const dotenv = require('dotenv');
        const path = require('path');
        dotenv.config({ path: path.join(__dirname, '../backend/.env') });

        const prompt = `
Parse the following resume and extract structured information.
Return ONLY valid JSON. Do not include markdown code block formatting (like \`\`\`json). Just return the raw JSON object.

Format:
{
  "name": "string",
  "email": "string or null",
  "phone": "string or null",
  "location": "string or null",
  "experience": {
    "totalYears": number,
    "companies": [
      {
        "companyName": "string",
        "role": "string",
        "startDate": "string",
        "endDate": "string",
        "duration": "string"
      }
    ]
  },
  "education": {
    "collegeName": "string",
    "course": "string",
    "passingYear": number,
    "cgpa": number
  },
  "skills": ["skill1", "skill2"],
  "summary": "professional summary"
}

Resume Text:
${resumeText}
`;

        let responseText = '';
        try {
            logger.info('Calling Gemini to parse whole resume...');
            const apiKey = process.env.GEMINI_API_KEY;
            if (!apiKey) {
                throw new Error("GEMINI_API_KEY not found");
            }
            const { GoogleGenerativeAI } = require('@google/generative-ai');
            const genAI = new GoogleGenerativeAI(apiKey);
            const modelName = process.env.GEMINI_MODEL_NAME || 'gemini-2.0-flash';
            const model = genAI.getGenerativeModel({ model: modelName });
            const result = await model.generateContent(prompt);
            responseText = result.response.text();
        } catch (error) {
            logger.info('Gemini failed/rate-limited, switching to OpenRouter...');
            try {
                const openrouterApiKey = process.env.OPENROUTER_API_KEY;
                if (!openrouterApiKey) {
                    throw new Error("OPENROUTER_API_KEY not found in env");
                }
                const OpenAIClass = require('openai');
                const OpenAI = OpenAIClass.OpenAI || OpenAIClass;
                const openrouter = new OpenAI({
                    apiKey: openrouterApiKey,
                    baseURL: 'https://openrouter.ai/api/v1',
                });
                const response = await openrouter.chat.completions.create({
                    model: process.env.OPENROUTER_MODEL || 'google/gemini-2.5-flash',
                    messages: [
                        {
                            role: 'user',
                            content: prompt,
                        },
                    ],
                });
                responseText = response.choices[0]?.message?.content || '';
            } catch (openRouterError) {
                logger.error('Both Gemini and OpenRouter failed', openRouterError);
                throw openRouterError;
            }
        }

        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            throw new Error('No JSON found in AI response: ' + responseText);
        }
        
        return JSON.parse(jsonMatch[0]);
    }
}

export default new ResumeParsingUtils();
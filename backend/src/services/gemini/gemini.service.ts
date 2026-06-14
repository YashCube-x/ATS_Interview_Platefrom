 import { getGeminiModel } from '@config/gemini.config';
import { Logger } from '@common/logger';
import OpenAI from 'openai';

const logger = new Logger('GeminiService');

const openrouter = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: 'https://openrouter.ai/api/v1',
});

export interface ParsedResume {
  name: string;
  email?: string;
  phone?: string;
  location?: string;
  experience: {
    totalYears: number;
    companies?: Array<{
      companyName: string;
      role: string;
      startDate: string;
      endDate: string;
      duration: string;
    }>;
  };
  education?: {
    collegeName: string;
    course: string;
    passingYear: number;
    cgpa?: number;
  };
  skills: string[];
  summary?: string;
}

export class GeminiService {
  private async callOpenRouter(prompt: string): Promise<string> {
    const response = await openrouter.chat.completions.create({
      model:
        process.env.OPENROUTER_MODEL ||
        'google/gemini-2.5-flash',
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    return response.choices[0]?.message?.content || '';
  }

  private async generateText(prompt: string): Promise<string> {
    try {
      const model = getGeminiModel();
      const result = await model.generateContent(prompt);
      return result.response.text();
    } catch (error) {
      logger.warn('Gemini failed, switching to OpenRouter...');
      return await this.callOpenRouter(prompt);
    }
  }

  async parseResume(resumeText: string): Promise<ParsedResume> {
    try {
      logger.info('Starting resume parsing...');

      const prompt = `
You are an expert ATS (Applicant Tracking System) Parsing Engine. Your task is to extract structural information from the provided raw resume text and format it into a valid JSON object matching the JSON Target Schema.

Strictly adhere to the following JSON structure and rules:
1. Do not include any conversational filler, markdown code block wrappers (like \`\`\`json), or markdown prose. Return ONLY the raw valid JSON string.
2. If a specific data field is missing from the resume text, map it as null or an empty array [] where appropriate.
3. Calculate or extract the 'totalYears' of experience as a precise number or float based on duration metrics.

JSON Target Schema:
{
  "name": "Full Name",
  "email": "Primary Email Address",
  "phone": "Contact Number",
  "location": "City, Country or State",
  "experience": {
    "totalYears": 0,
    "companies": [
      {
        "companyName": "Company or Organization Name",
        "role": "Job Title or Designation",
        "startDate": "Month Year",
        "endDate": "Month Year or Present",
        "duration": "Total Duration in months/years"
      }
    ]
  },
  "education": {
    "collegeName": "Institution or University Name",
    "course": "Degree and Specialization",
    "passingYear": 0,
    "cgpa": 0
  },
  "skills": ["Skill1", "Skill2", "Skill3"]
}

Raw Resume Text to Parse:
${resumeText}
`;

      const responseText = await this.generateText(prompt);

      const jsonMatch = responseText.match(/\{[\s\S]*\}/);

      if (!jsonMatch) {
        throw new Error('No JSON found in AI response');
      }

      const parsed: ParsedResume = JSON.parse(jsonMatch[0]);

      logger.info('Resume parsed successfully');
      return parsed;
    } catch (error) {
      logger.error('Resume parsing failed', error);
      throw error;
    }
  }

  async generateAISummary(
    resumeText: string,
    parsedData: ParsedResume
  ): Promise<string> {
    try {
      const prompt = `
You are an expert AI Resume Parser. Your job is to extract raw resume text and compile it into a single, highly dense, keyword-rich semantic summary paragraph optimized for Vector DB embeddings.

Follow these strict rules:
1. Output ONLY the final paragraph. Do not include any introduction, conversational filler, markdown formatting (such as code blocks), or explanation.
2. Maintain this exact template format within the single paragraph:
"Role: [Title]. Education: [Degree, College, GPA]. Core Competencies: [Key fields/subjects]. Tech Stack & Tools: [Software/Tools/Languages]. Professional Experience: [Company, short action summary of impact]. Key Projects: [Project names and key quantitative impacts/tech used]. Activities: [Relevant roles/extracurriculars]."
3. Do not invent details. Only use what is explicitly provided in the text.

### RAW RESUME CONTENT:
${resumeText}

### OUTPUT:
`;

      const summary = await this.generateText(prompt);

      logger.info('AI summary generated successfully');
      return summary;
    } catch (error) {
      logger.error('AI summary generation failed', error);
      throw error;
    }
  }

  async parseJobDescription(jobDescription: string): Promise<{
    title: string;
    requiredSkills: string[];
    preferredSkills: string[];
    minimumExperience: number;
    summary: string;
  }> {
    try {
      const prompt = `
Parse this Job Description.

Return ONLY JSON:

{
  "title": "",
  "requiredSkills": [],
  "preferredSkills": [],
  "minimumExperience": 0,
  "summary": ""
}

Job Description:
${jobDescription}
`;

      const responseText = await this.generateText(prompt);

      const jsonMatch = responseText.match(/\{[\s\S]*\}/);

      if (!jsonMatch) {
        throw new Error('No JSON found in AI response');
      }

      const parsed = JSON.parse(jsonMatch[0]);

      logger.info('Job description parsed successfully');
      return parsed;
    } catch (error) {
      logger.error('Job description parsing failed', error);
      throw error;
    }
  }

  async generateJobEmbeddingText(
    jobDescription: string
  ): Promise<string> {
    try {
      const prompt = `
You are an expert ATS (Applicant Tracking System) assistant. Your task is to combine structured job description details into a single, dense, semantic query paragraph optimized for Vector DB search.

Follow these strict rules:
1. Output ONLY the final paragraph. No intros, no conversational fillers, and no markdown.
2. Structure the paragraph exactly like this:
"Job Role: [Job Title]. Job Type: [Job Type, Location]. Required Experience: At least [Min. Experience] years. Required Education: [Education] degree. Core Technical Skills: [Required Skills]. Key Responsibilities and Context: [A concise, keyword-dense summary of the Description field]."
3. Do not invent keywords; rely strictly on the provided input job description.

### INPUT JOB DESCRIPTION:
${jobDescription}

### OUTPUT:
`;

      const embeddingText = await this.generateText(prompt);

      logger.info('Job embedding text generated successfully');

      return embeddingText;
    } catch (error) {
      logger.error('Job embedding text generation failed', error);
      throw error;
    }
  }

  async classifyEmail(emailData: {
    subject: string;
    from: string;
    body: string;
  }): Promise<'APPLICATION' | 'SPAM' | 'FRAUD'> {
    try {
      logger.info('Classifying email...');
      const prompt = `
You are an AI assistant for a recruitment Applicant Tracking System (ATS).
Analyze the following email metadata and content, and classify it into one of these three categories:
1. "APPLICATION" - If it is a genuine candidate applying for a job, submitting their resume, cv, or inquiring about an open role.
2. "SPAM" - If it is an advertisement, newsletter, promotional email, marketing, system notification, or auto-reply.
3. "FRAUD" - If it is a phishing attempt, suspicious link, suspicious sender domain, fake job offer, scam, or security threat.

Email Details:
From: ${emailData.from}
Subject: ${emailData.subject}
Body:
${emailData.body.substring(0, 2000)}

Return ONLY a single JSON object in this format:
{
  "classification": "APPLICATION" | "SPAM" | "FRAUD",
  "reason": "brief reason for classification"
}
`;

      const responseText = await this.generateText(prompt);
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        logger.warn('Could not parse JSON classification, defaulting to APPLICATION');
        return 'APPLICATION';
      }

      const result = JSON.parse(jsonMatch[0]);
      logger.info(`Email classified as: ${result.classification}. Reason: ${result.reason}`);
      return result.classification || 'APPLICATION';
    } catch (error) {
      logger.error('Email classification failed, defaulting to APPLICATION', error);
      return 'APPLICATION';
    }
  }
}

export default new GeminiService();
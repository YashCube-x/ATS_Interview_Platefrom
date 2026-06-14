import { Ollama } from 'ollama';
import { Logger } from '@common/logger';
import { envConfig } from '@config/env.config';

const logger = new Logger('OllamaService');

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

export class OllamaService {
  private ollama: Ollama;
  private modelName: string;

  constructor() {
    const host = envConfig.OLLAMA_BASE_URL;
    this.modelName = envConfig.OLLAMA_MODEL;
    this.ollama = new Ollama({ host });
    logger.info(`Ollama Service initialized (Host: ${host}, Model: ${this.modelName})`);
  }

  /**
   * Generate vector embedding using a local Ollama embedding model (e.g., nomic-embed-text)
   */
  async generateEmbedding(text: string): Promise<number[]> {
    const embeddingModel = envConfig.OLLAMA_EMBEDDING_MODEL;
    try {
      logger.info(`Generating embedding using Ollama model ${embeddingModel}...`);
      const response = await this.ollama.embeddings({
        model: embeddingModel,
        prompt: text,
      });
      logger.info(`Successfully generated embedding using Ollama model ${embeddingModel}`);
      return response.embedding;
    } catch (error) {
      logger.error(`Failed to generate embedding with Ollama model ${embeddingModel}`, error);
      throw error;
    }
  }

  /**
   * Helper to generate text using the local Ollama model
   */
  private async generateText(prompt: string, format?: 'json'): Promise<string> {
    try {
      logger.info(`Sending prompt to Ollama model ${this.modelName}...`);
      const response = await this.ollama.chat({
        model: this.modelName,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
        format: format,
      });

      return response.message.content || '';
    } catch (error) {
      logger.error(`Ollama request failed using model ${this.modelName}`, error);
      throw error;
    }
  }

  /**
   * Parse resume text into structured JSON format
   */
  async parseResume(resumeText: string): Promise<ParsedResume> {
    try {
      logger.info('Starting resume parsing with Ollama...');

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

      const responseText = await this.generateText(prompt, 'json');

      // Attempt parsing directly
      const parsed: ParsedResume = JSON.parse(responseText);
      logger.info('Resume parsed successfully with Ollama');
      return parsed;
    } catch (error) {
      logger.error('Resume parsing failed with Ollama', error);
      throw error;
    }
  }

  /**
   * Generate a professional AI summary for the resume
   */
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
      logger.info('AI summary generated successfully with Ollama');
      return summary.trim();
    } catch (error) {
      logger.error('AI summary generation failed with Ollama', error);
      throw error;
    }
  }

  /**
   * Parse job descriptions into structured JSON format
   */
  async parseJobDescription(jobDescription: string): Promise<{
    title: string;
    requiredSkills: string[];
    preferredSkills: string[];
    minimumExperience: number;
    summary: string;
  }> {
    try {
      const prompt = `
Parse this Job Description and return a JSON object.
You must return only valid JSON matching this schema:

{
  "title": "Job Title",
  "requiredSkills": ["skill1", "skill2"],
  "preferredSkills": ["skill1", "skill2"],
  "minimumExperience": number,
  "summary": "Short 2-3 sentence description of the role"
}

Job Description:
${jobDescription}
`;

      const responseText = await this.generateText(prompt, 'json');
      const parsed = JSON.parse(responseText);
      logger.info('Job description parsed successfully with Ollama');
      return parsed;
    } catch (error) {
      logger.error('Job description parsing failed with Ollama', error);
      throw error;
    }
  }

  /**
   * Generate a dense description of the job suitable for embeddings
   */
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
      logger.info('Job embedding text generated successfully with Ollama');
      return embeddingText.trim();
    } catch (error) {
      logger.error('Job embedding text generation failed with Ollama', error);
      throw error;
    }
  }
}

export default new OllamaService();

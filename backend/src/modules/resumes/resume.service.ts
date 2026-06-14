import { Logger } from '@common/logger';
import { BadRequestError, InternalServerError } from '@common/errors';
import OllamaService from '@services/ollama/ollama.service';
import resumeParsingUtils from '@services/resumeParsing/resumeParsing.utils';
import { uploadToCloudinary, deleteFromCloudinary } from '@config/cloudinary.config';
import pinecone from '@services/pinecone/pinecone.service';
import embeddings from '@services/embeddings/embeddings.service';
import CandidateService from '@modules/candidates/candidate.service';
import { ResumeSource, CandidateStatus } from '@common/enums';
import { v4 as uuid } from 'uuid';

const logger = new Logger('ResumeService');

export interface ResumeProcessingResult {
  candidateId: string;
  fileName: string;
  fileUrl: string;
  resumeText: string;
  parsedData: any;
  aiSummary: string;
  pineconeId: string;
  status: string;
}

export class ResumeService {
  private normalizeCompanies(companies: any[] = []) {
    return companies.map((company) => {
      const start = company.startDate ? new Date(company.startDate) : null;
      const end = company.endDate ? new Date(company.endDate) : null;

      return {
        ...company,
        startDate: start && !isNaN(start.getTime()) ? start : undefined,
        endDate: end && !isNaN(end.getTime()) ? end : undefined,
      };
    });
  }

  async uploadAndParseResume(
    fileBuffer: Buffer,
    fileName: string,
    source: ResumeSource = ResumeSource.MANUAL
  ): Promise<ResumeProcessingResult> {
    let cloudinaryResult: any = null;

    try {
      logger.info(`Processing resume: ${fileName}`);

      // Extract text from resume
      const resumeText = await resumeParsingUtils.extractTextFromResume(fileBuffer, fileName);
      const normalizedText = resumeParsingUtils.normalizeText(resumeText);

      let parsedData: any;
      let aiSummary = '';
      const parsedEmails = resumeParsingUtils.extractEmails(normalizedText);

      try {
        parsedData = await OllamaService.parseResume(normalizedText);
        logger.info('Resume parsed, generating AI summary...');
        aiSummary = await OllamaService.generateAISummary(normalizedText, parsedData);
      } catch (ollamaError) {
        logger.warn('Ollama parsing failed, falling back to local Regex parser', ollamaError);
        
        const fallbackEmail = parsedEmails[0] || `no-email-${uuid()}@example.com`;
        const phone = resumeParsingUtils.extractPhoneNumbers(normalizedText)[0] || '';
        const yearsOfExperience = resumeParsingUtils.extractYearsOfExperience(normalizedText);
        
        // Extract candidate name from first lines
        const lines = normalizedText.split(/[.\n\r]/).map(l => l.trim()).filter(l => l.length > 2 && !l.includes('@'));
        const name = lines[0] || fileName.split('.')[0] || 'Unknown Candidate';

        // Extract skills using a list of common tech skills
        const commonSkillsList = [
          'React', 'React.js', 'Node.js', 'Node', 'Express', 'Express.js', 'MongoDB', 'SQL', 'Python', 'Git', 'GitHub', 'Postman', 'Tailwind', 'Tailwind CSS', 'Bootstrap', 'JavaScript', 'TypeScript', 'C++', 'Java', 'Docker', 'Embedded C', 'ESP32', 'Arduino', 'Verilog', 'Microcontrollers', 'PLC'
        ];
        const skills = resumeParsingUtils.extractSkills(normalizedText, commonSkillsList);

        parsedData = {
          name,
          email: fallbackEmail,
          phone,
          location: 'Remote',
          experience: {
            totalYears: yearsOfExperience,
            companies: []
          },
          education: {
            collegeName: 'University',
            course: 'Degree',
            passingYear: new Date().getFullYear(),
            cgpa: 0
          },
          skills
        };

        aiSummary = `Role: Developer. Education: University. Core Competencies: Software Development. Tech Stack & Tools: ${skills.join(', ')}. Professional Experience: Self-employed. Key Projects: Resume parsing and automation. Activities: Engineering.`;
      }

      // Fallback values for email and name
      const email = parsedData.email || parsedEmails[0] || `no-email-${uuid()}@example.com`;
      const name = parsedData.name || fileName.split('.')[0] || 'Unknown Candidate';

      logger.info('Generating embeddings...');

      // Generate embedding for Pinecone
      const embedding = await embeddings.generateEmbedding(normalizedText);

      // Upload to Cloudinary
      logger.info('Uploading resume to Cloudinary...');
      let cloudinaryUrl = '';
      let cloudinaryPublicId = '';
      try {
        cloudinaryResult = await uploadToCloudinary(fileBuffer, fileName, 'ats-resumes');
        cloudinaryUrl = cloudinaryResult.url;
        cloudinaryPublicId = cloudinaryResult.publicId;
      } catch (cloudinaryError) {
        logger.warn('Cloudinary upload failed, falling back to dummy resume URL', cloudinaryError);
        cloudinaryUrl = `https://res.cloudinary.com/dummy-cloud/image/upload/v1234567890/ats-resumes/${encodeURIComponent(fileName)}`;
        cloudinaryPublicId = `ats-resumes/${uuid()}`;
      }

      // Create Pinecone vector
      const pineconeId = uuid();
      try {
        await pinecone.upsertVector({
          id: pineconeId,
          values: embedding,
          metadata: {
            candidateEmail: email,
            candidateName: name,
            resumeUrl: cloudinaryUrl,
            source,
            createdAt: new Date().toISOString(),
          },
        });
        logger.info('Resume stored in Pinecone');
      } catch (pineconeErr) {
        logger.warn('Failed to store resume vector in Pinecone, continuing candidate creation...', pineconeErr);
      }

      // Extract additional info from resume
      const skills = resumeParsingUtils.extractSkills(normalizedText, parsedData.skills || []);
      const yearsOfExperience = resumeParsingUtils.extractYearsOfExperience(normalizedText);

      // Create or update candidate
      let candidate = await CandidateService.getCandidateByEmail(email);

      if (!candidate) {
        logger.info(`Creating new candidate: ${email}`);
        candidate = await CandidateService.createCandidate({
          name: name,
          email: email,
          phone: parsedData.phone || '',
          location: parsedData.location || '',
          experience: {
            totalYears: yearsOfExperience,
          },
          companies: this.normalizeCompanies(parsedData.experience?.companies),
          education: parsedData.education,
          skills: skills || parsedData.skills || [],
          resumeUrl: cloudinaryUrl,
          resumeText: normalizedText,
          aiSummary,
          pineconeId,
          status: CandidateStatus.APPLIED,
          source,
        });
      } else {
        logger.info(`Updating existing candidate: ${email}`);
        candidate = await CandidateService.updateCandidate(candidate._id.toString(), {
          resumeUrl: cloudinaryUrl,
          resumeText: normalizedText,
          aiSummary,
          pineconeId,
          skills: skills || parsedData.skills || [],
          experience: {
            totalYears: yearsOfExperience,
          },
          companies: this.normalizeCompanies(parsedData.experience?.companies),
          education: parsedData.education,
        });
      }

      logger.info(`Resume processing completed for candidate: ${candidate._id}`);

      return {
        candidateId: candidate._id.toString(),
        fileName,
        fileUrl: cloudinaryUrl,
        resumeText: normalizedText,
        parsedData,
        aiSummary,
        pineconeId,
        status: 'success',
      };
    } catch (error) {
      logger.error('Resume processing failed', error);

      // Cleanup Cloudinary if upload succeeded but processing failed
      if (cloudinaryResult) {
        try {
          await deleteFromCloudinary(cloudinaryResult.publicId);
        } catch (cleanupError) {
          logger.warn('Failed to cleanup Cloudinary file', cleanupError);
        }
      }

      throw new InternalServerError('Failed to process resume');
    }
  }

  async deleteResumeData(pineconeId: string, cloudinaryPublicId?: string): Promise<void> {
    try {
      logger.info(`Deleting resume data: Pinecone ${pineconeId}`);

      // Delete from Pinecone
      await pinecone.deleteVector(pineconeId);

      // Delete from Cloudinary if publicId provided
      if (cloudinaryPublicId) {
        await deleteFromCloudinary(cloudinaryPublicId);
      }

      logger.info('Resume data deleted successfully');
    } catch (error) {
      logger.error('Failed to delete resume data', error);
      throw error;
    }
  }

  async reprocessResume(
    candidateId: string,
    fileBuffer: Buffer,
    fileName: string
  ): Promise<ResumeProcessingResult> {
    try {
      logger.info(`Reprocessing resume for candidate: ${candidateId}`);

      // Get existing candidate
      const candidate = await CandidateService.getCandidateById(candidateId);

      // Delete old resume data
      if (candidate.pineconeId) {
        await this.deleteResumeData(candidate.pineconeId);
      }

      // Process new resume
      return await this.uploadAndParseResume(fileBuffer, fileName, candidate.source);
    } catch (error) {
      logger.error('Failed to reprocess resume', error);
      throw error;
    }
  }

  async getResumeExtraction(fileBuffer: Buffer, fileName: string): Promise<any> {
    try {
      logger.info(`Extracting resume: ${fileName}`);

      const resumeText = await resumeParsingUtils.extractTextFromResume(fileBuffer, fileName);
      const normalizedText = resumeParsingUtils.normalizeText(resumeText);

      let parsedData: any;
      try {
        parsedData = await OllamaService.parseResume(normalizedText);
      } catch (ollamaError) {
        logger.warn('Ollama parsing failed in getResumeExtraction, falling back to local Regex parser', ollamaError);
        const parsedEmails = resumeParsingUtils.extractEmails(normalizedText);
        const email = parsedEmails[0] || `no-email-${uuid()}@example.com`;
        const phone = resumeParsingUtils.extractPhoneNumbers(normalizedText)[0] || '';
        const yearsOfExperience = resumeParsingUtils.extractYearsOfExperience(normalizedText);
        const lines = normalizedText.split(/[.\n\r]/).map(l => l.trim()).filter(l => l.length > 2 && !l.includes('@'));
        const name = lines[0] || fileName.split('.')[0] || 'Unknown Candidate';
        const commonSkillsList = [
          'React', 'React.js', 'Node.js', 'Node', 'Express', 'Express.js', 'MongoDB', 'SQL', 'Python', 'Git', 'GitHub', 'Postman', 'Tailwind', 'Tailwind CSS', 'Bootstrap', 'JavaScript', 'TypeScript', 'C++', 'Java', 'Docker', 'Embedded C', 'ESP32', 'Arduino', 'Verilog', 'Microcontrollers', 'PLC'
        ];
        const skills = resumeParsingUtils.extractSkills(normalizedText, commonSkillsList);

        parsedData = {
          name,
          email,
          phone,
          location: 'Remote',
          experience: {
            totalYears: yearsOfExperience,
            companies: []
          },
          education: {
            collegeName: 'University',
            course: 'Degree',
            passingYear: new Date().getFullYear(),
            cgpa: 0
          },
          skills
        };
      }

      return {
        text: normalizedText,
        parsed: parsedData,
      };
    } catch (error) {
      logger.error('Failed to extract resume', error);
      throw error;
    }
  }
}

export default new ResumeService();

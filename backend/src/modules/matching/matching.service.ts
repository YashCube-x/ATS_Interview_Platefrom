import { Logger } from '@common/logger';
import { NotFoundError, InternalServerError } from '@common/errors';
import finalScoreEngine, { CandidateMatchResult } from '@services/scoring/finalScore.engine';
import semanticScoreEngine from '@services/scoring/semanticScore.engine';
import pinecone from '@services/pinecone/pinecone.service';
import { MatchingResult } from '@database/models/matchingResult.model';
import JobService from '@modules/jobs/job.service';
import CandidateService from '@modules/candidates/candidate.service';
import { EducationLevel } from '@services/scoring/educationScore.engine';
import embeddings from '@services/embeddings/embeddings.service';

const logger = new Logger('MatchingService');

export interface MatchingScoreDetails {
  jobId: string;
  candidateId: string;
  candidateName: string;
  candidateEmail: string;
  finalScore: number;
  breakdown: {
    semantic: number;
    skills: number;
    experience: number;
    projects: number;
    education: number;
  };
  matchDetails: {
    matchedSkills: string[];
    missingSkills: string[];
    meetsExperienceRequirement: boolean;
    meetsEducationRequirement: boolean;
  };
}

export class MatchingService {
  async matchCandidatesToJob(jobId: string): Promise<MatchingScoreDetails[]> {
    try {
      logger.info(`Starting matching process for job: ${jobId}`);

      // Get job details
      const job = await JobService.getJobById(jobId);

      // Parse job description with Gemini to get summary
      logger.info('Parsing job description...');

      // Search Pinecone for relevant resumes
      logger.info(`Searching Pinecone for matching candidates...`);

      let pineconeResults: any[] = [];
      try {
        const jobEmbedding = await embeddings.generateEmbedding(job.description);
        pineconeResults = await pinecone.queryVectors(jobEmbedding, 100);
        logger.info(`Found ${pineconeResults.length} candidates from Pinecone`);
      } catch (err) {
        logger.warn('Failed to query Pinecone. Falling back to MongoDB candidate list.', err);
      }

      // Resolve candidate records
      const candidateList = [];
      if (pineconeResults && pineconeResults.length > 0) {
        for (const result of pineconeResults) {
          try {
            const candidateId = result.metadata?.candidateId || result.id;
            let candidate = null;
            if (candidateId && candidateId.length === 24) {
              try {
                candidate = await CandidateService.getCandidateById(candidateId);
              } catch (err) {}
            }
            if (!candidate) {
              candidate = await CandidateService.getCandidateByPineconeId(result.id);
            }
            if (candidate) {
              candidateList.push(candidate);
            } else {
              logger.warn(`Candidate not found for candidateId ${candidateId} or Pinecone ID ${result.id}`);
            }
          } catch (err) {
            logger.error(`Error resolving Pinecone candidate: ${err}`);
          }
        }
      }

      // Fallback: if Pinecone returned 0 candidates or failed, query all candidates from MongoDB
      if (candidateList.length === 0) {
        logger.info('Pinecone list is empty. Pulling all candidates from MongoDB database for matching...');
        const dbCandidatesResult = await CandidateService.listCandidates({ limit: 1000 });
        candidateList.push(...dbCandidatesResult.candidates);
        logger.info(`Loaded ${candidateList.length} candidates from MongoDB for matching`);
      }

      // Calculate full matching scores for each candidate
      const matchingScores: MatchingScoreDetails[] = [];

      for (const candidate of candidateList) {
        try {
          const candidateDbId = candidate._id.toString();

          // Map education string to enum
          const candidateEducation: EducationLevel = (candidate.education?.collegeName
            ? EducationLevel.BACHELORS
            : EducationLevel.HIGH_SCHOOL) as EducationLevel;

          // Calculate full score
          const scoreResult = await finalScoreEngine.calculateFullMatchingScore(
            candidateDbId,
            candidate.skills || [],
            candidate.experience?.totalYears || 0,
            candidateEducation,
            candidate.resumeText,
            job.requiredSkills || [],
            job.preferredSkills || [],
            job.minimumExperience || 0,
            (job.educationRequirement as EducationLevel) || EducationLevel.BACHELORS,
            job.description,
            job.projectRequirement?.split(',').map((p) => p.trim()) || []
          );

          // Store result in database
          await MatchingResult.findOneAndUpdate(
            { jobId, candidateId: candidateDbId },
            {
              jobId,
              candidateId: candidateDbId,
              semanticScore: scoreResult.breakdown.semantic,
              skillScore: scoreResult.breakdown.skills,
              experienceScore: scoreResult.breakdown.experience,
              projectScore: scoreResult.breakdown.projects,
              educationScore: scoreResult.breakdown.education,
              finalScore: scoreResult.finalScore,
              breakdown: scoreResult.breakdown,
              matchedSkills: scoreResult.details.matchedSkills,
              unmatchedSkills: scoreResult.details.missingSkills,
            },
            { upsert: true }
          );

          matchingScores.push({
            jobId,
            candidateId: candidateDbId,
            candidateName: candidate.name,
            candidateEmail: candidate.email,
            finalScore: scoreResult.finalScore,
            breakdown: scoreResult.breakdown,
            matchDetails: {
              matchedSkills: scoreResult.details.matchedSkills || [],
              missingSkills: scoreResult.details.missingSkills || [],
              meetsExperienceRequirement: scoreResult.details.meetsExperienceRequirement || false,
              meetsEducationRequirement: scoreResult.details.meetsEducationRequirement || false,
            },
          });
        } catch (error) {
          logger.warn(`Failed to calculate score for candidate ${candidate._id}`, error);
          continue;
        }
      }

      // Sort by final score descending
      matchingScores.sort((a, b) => b.finalScore - a.finalScore);

      // Add rank
      matchingScores.forEach((score, index) => {
        score.finalScore = Math.round(score.finalScore * 100) / 100; // Round to 2 decimals
      });

      logger.info(`Matching completed for job ${jobId}. Found ${matchingScores.length} candidates.`);

      return matchingScores;
    } catch (error) {
      logger.error('Matching process failed', error);
      throw new InternalServerError('Failed to match candidates to job');
    }
  }

  async getMatchingResults(jobId: string, page: number = 1, limit: number = 20) {
    try {
      logger.info(`Fetching matching results for job: ${jobId}, page: ${page}, limit: ${limit}`);

      const total = await MatchingResult.countDocuments({ jobId });

      const results = await MatchingResult.find({ jobId })
        .sort({ finalScore: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .populate('candidateId', 'name email skills experience resumeUrl aiSummary resumeText');

      return {
        results,
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      };
    } catch (error) {
      logger.error('Failed to fetch matching results', error);
      throw error;
    }
  }

  async getTopCandidatesForJob(jobId: string, topN: number = 10): Promise<MatchingScoreDetails[]> {
    try {
      logger.info(`Getting top ${topN} candidates for job: ${jobId}`);

      const results = await MatchingResult.find({ jobId })
        .sort({ finalScore: -1 })
        .limit(topN)
        .populate('candidateId', 'name email skills experience resumeUrl aiSummary resumeText');

      return results as any[];
    } catch (error) {
      logger.error('Failed to get top candidates', error);
      throw error;
    }
  }

  async recalculateMatchingForJob(jobId: string): Promise<void> {
    try {
      logger.info(`Recalculating matching for job: ${jobId}`);

      // Delete existing results
      await MatchingResult.deleteMany({ jobId });

      // Recalculate
      await this.matchCandidatesToJob(jobId);

      logger.info(`Matching recalculated for job: ${jobId}`);
    } catch (error) {
      logger.error('Failed to recalculate matching', error);
      throw error;
    }
  }
}

export default new MatchingService();

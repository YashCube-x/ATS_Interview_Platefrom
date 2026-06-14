import { Logger } from '@common/logger';
import { envConfig } from '@config/env.config';
import skillScoreEngine from './skillScore.engine';
import experienceScoreEngine from './experienceScore.engine';
import educationScoreEngine, { EducationLevel } from './educationScore.engine';
import projectScoreEngine from './projectScore.engine';
import semanticScoreEngine from './semanticScore.engine';

const logger = new Logger('FinalScoreEngine');

export interface MatchingScoreBreakdown {
  semantic: number;
  skills: number;
  experience: number;
  projects: number;
  education: number;
}

export interface CandidateMatchResult {
  candidateId: string;
  finalScore: number;
  breakdown: MatchingScoreBreakdown;
  details: {
    matchedSkills?: string[];
    missingSkills?: string[];
    meetsExperienceRequirement?: boolean;
    meetsEducationRequirement?: boolean;
  };
}

export class FinalScoreEngine {
  calculateFinalScore(breakdown: MatchingScoreBreakdown): number {
    try {
      const weights = {
        semantic: envConfig.SEMANTIC_WEIGHT,
        skills: envConfig.SKILL_WEIGHT,
        experience: envConfig.EXPERIENCE_WEIGHT,
        projects: envConfig.PROJECT_WEIGHT,
        education: envConfig.EDUCATION_WEIGHT,
      };

      const score =
        breakdown.semantic * weights.semantic +
        breakdown.skills * weights.skills +
        breakdown.experience * weights.experience +
        breakdown.projects * weights.projects +
        breakdown.education * weights.education;

      logger.debug(`Final score calculated: ${score}`, {
        weights,
        breakdown,
      });

      return Math.min(100, Math.max(0, score));
    } catch (error) {
      logger.error('Error calculating final score', error);
      return 0;
    }
  }

  async calculateFullMatchingScore(
    candidateId: string,
    candidateSkills: string[],
    candidateYears: number,
    candidateEducation: EducationLevel,
    candidateResume: string,
    requiredSkills: string[],
    preferredSkills: string[],
    requiredYears: number,
    requiredEducation: EducationLevel,
    jobDescription: string,
    projectKeywords?: string[]
  ): Promise<CandidateMatchResult> {
    try {
      logger.info(`Calculating full matching score for candidate ${candidateId}...`);

      // Calculate individual scores
      const skillScore = skillScoreEngine.calculateSkillScore(
        candidateSkills,
        requiredSkills,
        preferredSkills
      );

      const experienceScore = experienceScoreEngine.calculateExperienceScore(
        candidateYears,
        requiredYears
      );

      const educationScore = educationScoreEngine.calculateEducationScore(
        candidateEducation,
        requiredEducation
      );

      const projectScore = projectScoreEngine.calculateProjectScore(
        candidateResume,
        projectKeywords
      );

      const semanticScore = await semanticScoreEngine.calculateSemanticScore(
        candidateResume,
        jobDescription
      );

      // Combine scores
      const breakdown: MatchingScoreBreakdown = {
        semantic: semanticScore,
        skills: skillScore.score,
        experience: experienceScore.score,
        projects: projectScore.score,
        education: educationScore.score,
      };

      const finalScore = this.calculateFinalScore(breakdown);

      logger.info(`Full matching score calculated: ${finalScore}`, {
        breakdown,
      });

      return {
        candidateId,
        finalScore,
        breakdown,
        details: {
          matchedSkills: skillScore.matchedRequired,
          missingSkills: skillScore.missingRequired,
          meetsExperienceRequirement: experienceScore.meetsRequirement,
          meetsEducationRequirement: educationScore.meetsRequirement,
        },
      };
    } catch (error) {
      logger.error('Error calculating full matching score', error);
      throw error;
    }
  }
}

export default new FinalScoreEngine();

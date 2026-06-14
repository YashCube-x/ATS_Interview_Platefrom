import { Logger } from '@common/logger';

const logger = new Logger('EducationScoreEngine');

export enum EducationLevel {
  HIGH_SCHOOL = 'high_school',
  BACHELORS = 'bachelors',
  MASTERS = 'masters',
  PHD = 'phd',
}

const educationHierarchy: Record<EducationLevel, number> = {
  [EducationLevel.HIGH_SCHOOL]: 1,
  [EducationLevel.BACHELORS]: 2,
  [EducationLevel.MASTERS]: 3,
  [EducationLevel.PHD]: 4,
};

export class EducationScoreEngine {
  calculateEducationScore(
    candidateEducation: EducationLevel,
    requiredEducation: EducationLevel,
    courseMatch: boolean = false
  ): {
    score: number;
    meetsRequirement: boolean;
  } {
    try {
      const candidateLevel = educationHierarchy[candidateEducation] || 0;
      const requiredLevel = educationHierarchy[requiredEducation] || 1;

      let score = 0;
      let meetsRequirement = false;

      if (candidateLevel >= requiredLevel) {
        meetsRequirement = true;
        score = 100; // Give full 100 points if they meet or exceed required level
      } else {
        // Below requirement
        score = (candidateLevel / requiredLevel) * 60; // Max 60% if below
      }

      logger.debug(`Education score calculated: ${score}`, {
        candidateEducation,
        requiredEducation,
        courseMatch,
        meetsRequirement,
      });

      return {
        score,
        meetsRequirement,
      };
    } catch (error) {
      logger.error('Error calculating education score', error);
      return {
        score: 0,
        meetsRequirement: false,
      };
    }
  }
}

export default new EducationScoreEngine();

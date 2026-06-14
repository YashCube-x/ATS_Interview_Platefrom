import { Logger } from '@common/logger';

const logger = new Logger('ExperienceScoreEngine');

export class ExperienceScoreEngine {
  calculateExperienceScore(
    candidateYears: number,
    requiredYears: number,
    preferredYears?: number
  ): {
    score: number;
    meetsRequirement: boolean;
  } {
    try {
      // If candidate has minimum required years
      if (candidateYears >= requiredYears) {
        // Give full score if meets required years
        let score = 80;

        // Bonus for exceeding requirements
        if (preferredYears && candidateYears >= preferredYears) {
          score = 100;
        } else if (preferredYears && candidateYears > requiredYears) {
          const excessYears = candidateYears - requiredYears;
          const bonus = (excessYears / (preferredYears - requiredYears)) * 20;
          score = Math.min(100, 80 + bonus);
        } else if (!preferredYears) {
          // If no preferredYears specified, meeting the requirement is 100%
          score = 100;
        }

        logger.debug(`Experience score calculated: ${score}`, {
          candidateYears,
          requiredYears,
          meetsRequirement: true,
        });

        return {
          score,
          meetsRequirement: true,
        };
      }

      // Partial score for below requirement
      const percentage = (candidateYears / requiredYears) * 100;
      const score = Math.max(0, percentage * 0.8); // Max 80% if below requirement

      logger.debug(`Experience score calculated: ${score}`, {
        candidateYears,
        requiredYears,
        meetsRequirement: false,
      });

      return {
        score,
        meetsRequirement: false,
      };
    } catch (error) {
      logger.error('Error calculating experience score', error);
      return {
        score: 0,
        meetsRequirement: false,
      };
    }
  }
}

export default new ExperienceScoreEngine();

import { Logger } from '@common/logger';

const logger = new Logger('SkillScoreEngine');

export class SkillScoreEngine {
  calculateSkillScore(
    candidateSkills: string[],
    requiredSkills: string[],
    preferredSkills: string[] = []
  ): {
    score: number;
    matchedRequired: string[];
    matchedPreferred: string[];
    missingRequired: string[];
  } {
    try {
      const matchSkills = (candSkill: string, reqSkill: string): boolean => {
        const normCand = candSkill.toLowerCase().replace(/[^a-z0-9]/g, ' ').trim();
        const normReq = reqSkill.toLowerCase().replace(/[^a-z0-9]/g, ' ').trim();
        
        if (normCand === normReq) return true;
        
        const candWords = normCand.split(/\s+/).filter(Boolean);
        const reqWords = normReq.split(/\s+/).filter(Boolean);
        
        if (candWords.length === 0 || reqWords.length === 0) return false;
        
        const reqInCand = reqWords.every(w => candWords.includes(w));
        const candInReq = candWords.every(w => reqWords.includes(w));
        
        return reqInCand || candInReq;
      };

      const matchedRequired: string[] = [];
      const missingRequired: string[] = [];

      requiredSkills.forEach((skill) => {
        const isMatched = candidateSkills.some((cSkill) => matchSkills(cSkill, skill));
        if (isMatched) {
          matchedRequired.push(skill);
        } else {
          missingRequired.push(skill);
        }
      });

      const matchedPreferred: string[] = [];
      preferredSkills.forEach((skill) => {
        const isMatched = candidateSkills.some((cSkill) => matchSkills(cSkill, skill));
        if (isMatched) {
          matchedPreferred.push(skill);
        }
      });

      // Calculate score: required skills match + bonus for preferred skills
      let score = 0;
      if (preferredSkills.length > 0) {
        const requiredMatch =
          requiredSkills.length > 0
            ? (matchedRequired.length / requiredSkills.length) * 80
            : 80;

        const preferredBonus = (matchedPreferred.length / preferredSkills.length) * 20;
        score = Math.min(100, requiredMatch + preferredBonus);
      } else {
        // If no preferred skills are specified, matching all required skills yields 100
        score = requiredSkills.length > 0
          ? (matchedRequired.length / requiredSkills.length) * 100
          : 100;
      }

      logger.debug(`Skill score calculated: ${score}`, {
        matchedRequired: matchedRequired.length,
        matchedPreferred: matchedPreferred.length,
        missingRequired: missingRequired.length,
      });

      return {
        score,
        matchedRequired,
        matchedPreferred,
        missingRequired,
      };
    } catch (error) {
      logger.error('Error calculating skill score', error);
      return {
        score: 0,
        matchedRequired: [],
        matchedPreferred: [],
        missingRequired: requiredSkills,
      };
    }
  }
}

export default new SkillScoreEngine();

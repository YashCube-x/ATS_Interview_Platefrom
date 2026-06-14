import { Logger } from '@common/logger';

const logger = new Logger('ProjectScoreEngine');

export class ProjectScoreEngine {
  calculateProjectScore(
    candidateResume: string,
    requiredProjectKeywords: string[] = []
  ): {
    score: number;
    matchedKeywords: string[];
  } {
    try {
      const resumeLower = candidateResume.toLowerCase();
      const matchedKeywords: string[] = [];

      // Look for project-related keywords
      const projectKeywords = [
        'project',
        'developed',
        'built',
        'created',
        'implemented',
        'designed',
        'architected',
        'deployed',
        'launched',
      ];

      // Check for general project experience
      let hasProjects = false;
      for (const keyword of projectKeywords) {
        if (resumeLower.includes(keyword)) {
          hasProjects = true;
          break;
        }
      }

      let baseScore = hasProjects ? 40 : 0;

      // Check for required project keywords
      for (const keyword of requiredProjectKeywords) {
        if (resumeLower.includes(keyword.toLowerCase())) {
          matchedKeywords.push(keyword);
        }
      }

      // Calculate bonus for matched keywords
      let score = 0;
      if (requiredProjectKeywords.length > 0) {
        const keywordBonus = (matchedKeywords.length / requiredProjectKeywords.length) * 60;
        score = Math.min(100, baseScore + keywordBonus);
      } else {
        // If no specific project keywords are required, having projects gives full 100 points
        score = hasProjects ? 100 : 0;
      }

      logger.debug(`Project score calculated: ${score}`, {
        hasProjects,
        matchedKeywords: matchedKeywords.length,
        totalKeywords: requiredProjectKeywords.length,
      });

      return {
        score,
        matchedKeywords,
      };
    } catch (error) {
      logger.error('Error calculating project score', error);
      return {
        score: 0,
        matchedKeywords: [],
      };
    }
  }
}

export default new ProjectScoreEngine();

import { Logger } from '@common/logger';
import pinecone from '@services/pinecone/pinecone.service';
import embeddings from '@services/embeddings/embeddings.service';

const logger = new Logger('SemanticScoreEngine');

export class SemanticScoreEngine {
  async calculateSemanticScore(
    candidateResumeText: string,
    jobDescription: string
  ): Promise<number> {
    try {
      logger.info('Calculating semantic score using Pinecone...');

      // Generate embeddings for both texts
      const candidateEmbedding = await embeddings.generateEmbedding(candidateResumeText);
      const jobEmbedding = await embeddings.generateEmbedding(jobDescription);

      // Calculate cosine similarity
      const similarity = await embeddings.cosineSimilarity(candidateEmbedding, jobEmbedding);

      // Convert similarity (-1 to 1) to score (0 to 100)
      const score = ((similarity + 1) / 2) * 100;

      logger.debug(`Semantic score calculated: ${score}`, {
        similarity,
      });

      return Math.min(100, Math.max(0, score));
    } catch (error) {
      logger.error('Error calculating semantic score', error);
      return 0;
    }
  }

  async calculateSemanticScoreWithPinecone(
    queryEmbedding: number[],
    matchScore: number
  ): Promise<number> {
    try {
      // Pinecone returns scores between 0 and 1 (cosine similarity)
      // Convert to 0-100 scale
      const score = matchScore * 100;

      logger.debug(`Semantic score from Pinecone: ${score}`);

      return Math.min(100, Math.max(0, score));
    } catch (error) {
      logger.error('Error calculating semantic score with Pinecone', error);
      return 0;
    }
  }
}

export default new SemanticScoreEngine();

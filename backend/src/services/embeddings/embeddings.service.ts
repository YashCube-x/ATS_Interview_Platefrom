import OllamaService from '@services/ollama/ollama.service';
import { Logger } from '@common/logger';

const logger = new Logger('EmbeddingsService');

export interface Embedding {
  values: number[];
  metadata?: Record<string, any>;
}

export class EmbeddingsService {
  async generateEmbedding(text: string): Promise<number[]> {
    try {
      logger.info('Generating embedding for text using Ollama...');
      const embedding = await OllamaService.generateEmbedding(text);
      logger.info('Embedding generated successfully with Ollama');
      return embedding;
    } catch (error) {
      logger.error('Ollama embedding generation failed', error);
      throw error;
    }
  }

  async generateMultipleEmbeddings(texts: string[]): Promise<number[][]> {
    try {
      logger.info(`Generating embeddings for ${texts.length} texts...`);

      const embeddings = await Promise.all(
        texts.map((text) => this.generateEmbedding(text))
      );

      logger.info('Multiple embeddings generated successfully');
      return embeddings;
    } catch (error) {
      logger.error('Multiple embeddings generation failed', error);
      throw error;
    }
  }

  async cosineSimilarity(embedding1: number[], embedding2: number[]): Promise<number> {
    if (embedding1.length !== embedding2.length) {
      throw new Error('Embeddings must have the same dimension');
    }

    let dotProduct = 0;
    let magnitude1 = 0;
    let magnitude2 = 0;

    for (let i = 0; i < embedding1.length; i++) {
      dotProduct += embedding1[i] * embedding2[i];
      magnitude1 += embedding1[i] * embedding1[i];
      magnitude2 += embedding2[i] * embedding2[i];
    }

    magnitude1 = Math.sqrt(magnitude1);
    magnitude2 = Math.sqrt(magnitude2);

    if (magnitude1 === 0 || magnitude2 === 0) {
      return 0;
    }

    return dotProduct / (magnitude1 * magnitude2);
  }
}

export default new EmbeddingsService();

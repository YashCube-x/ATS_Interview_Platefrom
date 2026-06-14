import { getPineconeIndex, getPineconeInstance } from '@config/pinecone.config';
import { Logger } from '@common/logger';
import { envConfig } from '@config/env.config';
import embeddings from '@services/embeddings/embeddings.service';

const logger = new Logger('PineconeService');

export interface PineconeVector {
  id: string;
  values: number[];
  metadata?: Record<string, any>;
}

export interface PineconeQueryResult {
  id: string;
  score: number;
  metadata?: Record<string, any>;
}

export class PineconeService {
  async upsertVector(vector: PineconeVector): Promise<void> {
    try {
      logger.info(`Upserting vector ${vector.id} to Pinecone...`);

      const index = await getPineconeIndex();

      await index.upsert([vector]);

      logger.info(`Vector ${vector.id} upserted successfully`);
    } catch (error) {
      logger.error('Failed to upsert vector to Pinecone', error);
      throw error;
    }
  }

  async upsertVectors(vectors: PineconeVector[]): Promise<void> {
    try {
      logger.info(`Upserting ${vectors.length} vectors to Pinecone...`);

      const index = await getPineconeIndex();

      // Batch the upserts
      const batchSize = envConfig.PINECONE_BATCH_SIZE;
      for (let i = 0; i < vectors.length; i += batchSize) {
        const batch = vectors.slice(i, i + batchSize);
        await index.upsert(batch);
      }

      logger.info(`${vectors.length} vectors upserted successfully`);
    } catch (error) {
      logger.error('Failed to upsert vectors to Pinecone', error);
      throw error;
    }
  }

  async queryVectors(
    embedding: number[],
    topK: number = envConfig.PINECONE_TOP_CANDIDATES
  ): Promise<PineconeQueryResult[]> {
    try {
      logger.info(`Querying Pinecone for top ${topK} results...`);

      const index = await getPineconeIndex();

      const queryResult = await index.query({
        vector: embedding,
        topK,
        includeMetadata: true,
      });

      const results: PineconeQueryResult[] = queryResult.matches?.map((match: any) => ({
        id: match.id,
        score: match.score,
        metadata: match.metadata,
      })) || [];

      logger.info(`Found ${results.length} results from Pinecone`);
      return results;
    } catch (error) {
      logger.error('Failed to query Pinecone', error);
      throw error;
    }
  }

  async deleteVector(id: string): Promise<void> {
    try {
      logger.info(`Deleting vector ${id} from Pinecone...`);

      const index = await getPineconeIndex();
      await index.deleteOne(id);

      logger.info(`Vector ${id} deleted successfully`);
    } catch (error) {
      logger.error('Failed to delete vector from Pinecone', error);
      throw error;
    }
  }

  async deleteVectors(ids: string[]): Promise<void> {
    try {
      logger.info(`Deleting ${ids.length} vectors from Pinecone...`);

      const index = await getPineconeIndex();
      await index.deleteMany(ids);

      logger.info(`${ids.length} vectors deleted successfully`);
    } catch (error) {
      logger.error('Failed to delete vectors from Pinecone', error);
      throw error;
    }
  }

  async queryByText(text: string, topK: number = envConfig.PINECONE_TOP_CANDIDATES): Promise<PineconeQueryResult[]> {
    try {
      logger.info('Querying Pinecone by text...');

      const embedding = await embeddings.generateEmbedding(text);
      return this.queryVectors(embedding, topK);
    } catch (error) {
      logger.error('Failed to query Pinecone by text', error);
      throw error;
    }
  }

  async getVectorStats(): Promise<any> {
    try {
      logger.info('Fetching Pinecone index stats...');

      const pinecone = getPineconeInstance();
      const indexStats = await pinecone.describeIndex(envConfig.PINECONE_INDEX_NAME);

      logger.info('Index stats fetched successfully');
      return indexStats;
    } catch (error) {
      logger.error('Failed to fetch Pinecone index stats', error);
      throw error;
    }
  }
}

export default new PineconeService();

import { Pinecone } from '@pinecone-database/pinecone';
import { Logger } from '@common/logger';
import { envConfig } from './env.config';

const logger = new Logger('PineconeConfig');

let pineconeInstance: Pinecone | null = null;

export const initPinecone = async (): Promise<Pinecone> => {
  try {
    logger.info('Initializing Pinecone...');
    const pinecone = new Pinecone({
      apiKey: envConfig.PINECONE_API_KEY,
    });

    pineconeInstance = pinecone;
    logger.info('Pinecone initialized successfully');
    return pinecone;
  } catch (error) {
    logger.error('Failed to initialize Pinecone', error);
    throw error;
  }
};

export const getPineconeInstance = (): Pinecone | null => {
  return pineconeInstance;
};

export const getPineconeIndex = async () => {
  const pinecone = getPineconeInstance();
  if (!pinecone) return null;
  return pinecone.index(envConfig.PINECONE_INDEX_NAME);
};

export const createPineconeIndex = async (
  indexName: string,
  dimension: number = 768
): Promise<void> => {
  try {
    const pinecone = getPineconeInstance();
    logger.info(`Creating Pinecone index: ${indexName}`);

    await pinecone.createIndex({
      name: indexName,
      dimension,
      metric: 'cosine',
      spec: {
        serverless: {
          cloud: 'aws',
          region: envConfig.PINECONE_ENVIRONMENT,
        },
      },
    });

    logger.info(`Pinecone index created: ${indexName}`);
  } catch (error: any) {
    if (error.message?.includes('already exists')) {
      logger.info(`Index ${indexName} already exists`);
    } else {
      logger.error('Failed to create Pinecone index', error);
      throw error;
    }
  }
};

export const deletePineconeIndex = async (indexName: string): Promise<void> => {
  try {
    const pinecone = getPineconeInstance();
    logger.info(`Deleting Pinecone index: ${indexName}`);
    await pinecone.deleteIndex(indexName);
    logger.info(`Pinecone index deleted: ${indexName}`);
  } catch (error) {
    logger.error('Failed to delete Pinecone index', error);
    throw error;
  }
};

export default {
  initPinecone,
  getPineconeInstance,
  getPineconeIndex,
  createPineconeIndex,
  deletePineconeIndex,
};

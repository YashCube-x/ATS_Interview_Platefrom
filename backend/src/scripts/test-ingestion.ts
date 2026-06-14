import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../../.env') });

import mongoose from 'mongoose';
import connectDatabase from '../config/database.config';
import EmailIngestionService from '../modules/emails/emailIngestion.service';

async function runIngestionTest() {
  try {
    console.log('Connecting to MongoDB...');
    await connectDatabase();
    console.log('Connected.');

    console.log('Starting resume ingestion from Gmail...');
    const result = await EmailIngestionService.ingestLatestResumes(5);
    console.log('✓ Ingestion complete! Processed resumes:', result.length);
    console.log(JSON.stringify(result, null, 2));

  } catch (error: any) {
    console.error('Error during ingestion:', error.message || error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected');
  }
}

runIngestionTest();

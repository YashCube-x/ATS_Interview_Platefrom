import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../../.env') });

import mongoose from 'mongoose';
import connectDatabase from '../config/database.config';

async function run() {
  try {
    console.log('Connecting to MongoDB...');
    await connectDatabase();
    console.log('Connected.');

    const db = mongoose.connection.db;
    if (!db) {
      throw new Error('Database connection not established');
    }
    const candidatesCol = db.collection('candidates');
    const count = await candidatesCol.countDocuments();
    console.log('Total candidates in DB:', count);

    const candidates = await candidatesCol.find({}).toArray();
    console.log('\nCandidate List:');
    candidates.forEach((c, idx) => {
      console.log(`${idx + 1}. ${c.name} (${c.email})`);
      console.log(`   Skills: ${JSON.stringify(c.skills || [])}`);
      console.log(`   Experience: ${JSON.stringify(c.experience || {})}`);
      console.log(`   Status: ${c.status || 'N/A'}`);
      console.log(`   Source: ${c.source || 'N/A'}`);
      console.log(`   Created At: ${c.createdAt}`);
    });

  } catch (error: any) {
    console.error('Error listing candidates:', error.message || error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected');
  }
}

run();

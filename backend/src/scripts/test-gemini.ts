import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../../.env') });

const apiKey = process.env.GEMINI_API_KEY;
const modelName = process.env.GEMINI_MODEL_NAME || 'gemini-2.0-flash';

console.log('Testing Gemini API...');
console.log('API Key:', apiKey ? 'FOUND (starts with ' + apiKey.substring(0, 5) + ')' : 'MISSING');
console.log('Model Name:', modelName);

if (!apiKey) {
  console.error('Error: GEMINI_API_KEY not found in env');
  process.exit(1);
}

const genAI = new GoogleGenerativeAI(apiKey);

async function test() {
  try {
    const model = genAI.getGenerativeModel({ model: modelName });
    console.log('Calling generateContent...');
    const result = await model.generateContent('Say hello in 3 words.');
    console.log('STATUS: Success!');
    console.log('RESPONSE:', result.response.text());
  } catch (error) {
    console.error('Error occurred:', error);
  }
}

test();

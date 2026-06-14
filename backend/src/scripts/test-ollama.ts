import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../../.env') });

import OllamaService from '../services/ollama/ollama.service';
import EmbeddingsService from '../services/embeddings/embeddings.service';

const dummyResume = `
JOHN DOE
Email: john.doe@example.com | Phone: +1-555-0199 | Location: New York, NY

PROFESSIONAL SUMMARY
Senior Software Engineer with over 6 years of experience building scalable backend APIs and microservices using Node.js, TypeScript, and Python.

EXPERIENCE
TechCorp Inc.
Senior Backend Engineer | January 2021 - Present
- Architected and built microservices in Node.js resulting in 30% reduction in API response times.
- Led a team of 4 engineers and mentored junior developers.

DevFlow LLC
Software Engineer | June 2018 - December 2020
- Built full-stack features using React and Express.js.
- Configured PostgreSQL databases and optimized slow queries.

EDUCATION
State University
B.S. in Computer Science | 2014 - 2018 | GPA: 3.8

SKILLS
Programming Languages: JavaScript, TypeScript, Python, SQL, C++
Frameworks & Libraries: Node.js, Express, React, NestJS
Databases & Cloud: PostgreSQL, MongoDB, Redis, AWS (S3, EC2)
`;

async function runTest() {
  console.log('====================================================');
  console.log('      OLLAMA LOCAL LLM INTEGRATION TEST             ');
  console.log('====================================================');

  const host = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
  const model = process.env.OLLAMA_MODEL || 'qwen2.5:3b';

  console.log(`Target Ollama Host:  ${host}`);
  console.log(`Target Ollama Model: ${model}\n`);

  console.log('1. Checking connection and parsing dummy resume...');
  try {
    const parsedData = await OllamaService.parseResume(dummyResume);
    console.log('✓ Success! Parsed Resume JSON Output:');
    console.log(JSON.stringify(parsedData, null, 2));

    console.log('\n2. Testing AI Summary generation...');
    const summary = await OllamaService.generateAISummary(dummyResume, parsedData);
    console.log('✓ Success! Generated Summary:');
    console.log(`"${summary}"\n`);

    console.log('3. Testing Job Description parsing...');
    const sampleJob = `
    Senior Node.js Developer
    We are looking for a backend engineer with at least 5 years of experience in JavaScript/TypeScript and Node.js.
    Key skills: Express, NestJS, MongoDB, REST APIs.
    Preferred: Docker, Kubernetes.
    `;
    const parsedJob = await OllamaService.parseJobDescription(sampleJob);
    console.log('✓ Success! Parsed Job JSON Output:');
    console.log(JSON.stringify(parsedJob, null, 2));

    console.log('\n4. Testing Ollama Embedding generation with nomic-embed-text...');
    const embeddingText = "Senior Node.js Developer with experience in Express, NestJS, and MongoDB";
    const embedding = await OllamaService.generateEmbedding(embeddingText);
    console.log('✓ Success! Generated embedding vector length:', embedding.length);
    console.log('First 5 dimensions:', embedding.slice(0, 5));

    console.log('\n5. Testing EmbeddingsService wrapper...');
    const wrapperEmbedding = await EmbeddingsService.generateEmbedding(embeddingText);
    console.log('✓ Success! EmbeddingsService wrapper returned vector length:', wrapperEmbedding.length);
    console.log('First 5 dimensions:', wrapperEmbedding.slice(0, 5));

    console.log('\n====================================================');
    console.log('🎉 ALL OLLAMA TESTS PASSED SUCCESSFULLY!');
    console.log('====================================================');
  } catch (error: any) {
    console.error('\n❌ TEST FAILED!');
    console.error('Error Details:', error.message || error);
    console.log('\nTroubleshooting Checklist:');
    console.log('1. Is the local Ollama desktop app running on your machine?');
    console.log('2. Have you downloaded the model? Run this in your command prompt:');
    console.log(`   ollama pull ${model}`);
    console.log('3. Can you reach the Ollama API? Try opening this URL in your browser:');
    console.log(`   ${host}`);
    console.log('====================================================');
    process.exit(1);
  }
}

runTest();

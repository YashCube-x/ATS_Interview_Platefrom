import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../../.env') });

import mongoose from 'mongoose';
import connectDatabase from '../config/database.config';
import skillScoreEngine from '../services/scoring/skillScore.engine';
import experienceScoreEngine from '../services/scoring/experienceScore.engine';
import educationScoreEngine, { EducationLevel } from '../services/scoring/educationScore.engine';
import projectScoreEngine from '../services/scoring/projectScore.engine';

const weights = {
  semantic: 0.4,
  skills: 0.3,
  experience: 0.15,
  projects: 0.1,
  education: 0.05,
};

async function testScoring() {
  try {
    console.log('Connecting to MongoDB...');
    await connectDatabase();
    console.log('Connected.');

    const db = mongoose.connection.db;
    if (!db) {
      throw new Error('Database connection not established');
    }
    const candidatesCol = db.collection('candidates');

    const kabir = await candidatesCol.findOne({ email: 'kabir.malhotra.test@example.com' });
    const ananya = await candidatesCol.findOne({ email: 'ananya.iyer.dev@example.com' });

    if (!kabir) console.log('Kabir Malhotra not found!');
    if (!ananya) console.log('Ananya Iyer not found!');

    const preferredSkills: string[] = [];
    const requiredYears = 0;
    const requiredEducation = EducationLevel.BACHELORS;

    const candidates = [
      { 
        name: 'Kabir Malhotra', 
        data: kabir, 
        requiredSkills: ['React.js', 'Node.js', 'Express.js', 'MongoDB', 'Tailwind CSS', 'Postman', 'Git'],
        jobName: 'Full-Stack Web Developer Intern (MERN Stack)'
      },
      { 
        name: 'Ananya Iyer', 
        data: ananya, 
        requiredSkills: ['React.js', 'Node.js', 'Express.js', 'MongoDB', 'Tailwind CSS', 'Postman', 'Git'],
        jobName: 'Full-Stack Web Developer Intern (MERN Stack)'
      }
    ];

    for (const cand of candidates) {
      const c = cand.data;
      if (!c) continue;

      console.log(`\n========================================`);
      console.log(`Scoring Candidate: ${cand.name} for ${cand.jobName}`);
      console.log(`========================================`);

      // 1. Skill Score
      const skillScoreResult = skillScoreEngine.calculateSkillScore(
        c.skills || [],
        cand.requiredSkills,
        preferredSkills
      );
      console.log('Skills Match result:', {
        score: skillScoreResult.score,
        matchedRequired: skillScoreResult.matchedRequired,
        missingRequired: skillScoreResult.missingRequired
      });

      // 2. Experience Score
      const expScoreResult = experienceScoreEngine.calculateExperienceScore(
        c.experience?.totalYears || 0,
        requiredYears
      );
      console.log('Experience Match result:', expScoreResult);

      // 3. Education Score
      const candidateEducation: EducationLevel = c.education?.collegeName ? EducationLevel.BACHELORS : EducationLevel.HIGH_SCHOOL;
      const eduScoreResult = educationScoreEngine.calculateEducationScore(
        candidateEducation,
        requiredEducation
      );
      console.log('Education Match result:', eduScoreResult);

      // 4. Project Score
      const projectScoreResult = projectScoreEngine.calculateProjectScore(
        c.resumeText || '',
        []
      );
      console.log('Project Match result:', projectScoreResult);

      // 5. Semantic Score
      // Assume a high semantic match for their target roles
      const semanticScore = 100; 

      // Final Score Calculation
      const breakdown = {
        semantic: semanticScore,
        skills: skillScoreResult.score,
        experience: expScoreResult.score,
        projects: projectScoreResult.score,
        education: eduScoreResult.score,
      };

      const finalScore =
        breakdown.semantic * weights.semantic +
        breakdown.skills * weights.skills +
        breakdown.experience * weights.experience +
        breakdown.projects * weights.projects +
        breakdown.education * weights.education;

      console.log(`\nBreakdown:`, breakdown);
      console.log(`Final Weighted Score: ${finalScore.toFixed(2)}%`);
    }

  } catch (error) {
    console.error('Error during test:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected');
  }
}

testScoring();

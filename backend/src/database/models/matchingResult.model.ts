import { Schema, model, Document } from 'mongoose';

export interface IMatchingResult extends Document {
  jobId: Schema.Types.ObjectId;
  candidateId: Schema.Types.ObjectId;
  semanticScore: number;
  skillScore: number;
  experienceScore: number;
  projectScore: number;
  educationScore: number;
  finalScore: number;
  breakdown: {
    semantic: number;
    skills: number;
    experience: number;
    projects: number;
    education: number;
  };
  matchedSkills?: string[];
  unmatchedSkills?: string[];
  rank?: number;
  createdAt: Date;
  updatedAt: Date;
}

const matchingResultSchema = new Schema<IMatchingResult>(
  {
    jobId: {
      type: Schema.Types.ObjectId,
      ref: 'Job',
      required: true,
      index: true,
    },
    candidateId: {
      type: Schema.Types.ObjectId,
      ref: 'Candidate',
      required: true,
      index: true,
    },
    semanticScore: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    skillScore: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    experienceScore: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    projectScore: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    educationScore: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    finalScore: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
      index: true,
    },
    breakdown: {
      semantic: Number,
      skills: Number,
      experience: Number,
      projects: Number,
      education: Number,
    },
    matchedSkills: [String],
    unmatchedSkills: [String],
    rank: Number,
  },
  {
    timestamps: true,
  }
);

// Compound index for efficient queries
matchingResultSchema.index({ jobId: 1, finalScore: -1 });

export const MatchingResult = model<IMatchingResult>('MatchingResult', matchingResultSchema);

import { Schema, model, Document } from 'mongoose';
import { CandidateStatus, ResumeSource } from '@common/enums';

export interface ICompany {
  companyName: string;
  role: string;
  startDate: Date;
  endDate?: Date;
  duration?: string;
}

export interface IEducation {
  collegeName: string;
  course: string;
  passingYear: number;
  cgpa?: number;
}

export interface ICandidate extends Document {
  name: string;
  email: string;
  phone: string;
  location: string;
  experience: {
    totalYears: number;
  };
  companies: ICompany[];
  education: IEducation;
  skills: string[];
  resumeUrl: string;
  resumeText: string;
  aiSummary: string;
  pineconeId: string;
  status: CandidateStatus;
  source: ResumeSource;
  selectedAt?: Date;
  rejectedAt?: Date;
  rejectionReason?: string;
  currentJobTitle?: string;
  currentCompany?: string;
  linkedinUrl?: string;
  portfolioUrl?: string;
  notes?: string;
  ratings?: {
    technicalSkills?: number;
    communication?: number;
    cultureFit?: number;
    overall?: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

const candidateSchema = new Schema<ICandidate>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    location: {
      type: String,
      trim: true,
    },
    experience: {
      totalYears: {
        type: Number,
        default: 0,
      },
    },
    companies: [
      {
        companyName: String,
        role: String,
        startDate: Date,
        endDate: Date,
        duration: String,
      },
    ],
    education: {
      collegeName: String,
      course: String,
      passingYear: Number,
      cgpa: Number,
    },
    skills: [String],
    resumeUrl: {
      type: String,
      required: true,
    },
    resumeText: {
      type: String,
      required: true,
    },
    aiSummary: {
      type: String,
    },
    pineconeId: {
      type: String,
      index: true,
    },
    status: {
      type: String,
      enum: Object.values(CandidateStatus),
      default: CandidateStatus.APPLIED,
      index: true,
    },
    source: {
      type: String,
      enum: Object.values(ResumeSource),
      default: ResumeSource.MANUAL,
    },
    selectedAt: Date,
    rejectedAt: Date,
    rejectionReason: String,
    currentJobTitle: String,
    currentCompany: String,
    linkedinUrl: String,
    portfolioUrl: String,
    notes: String,
    ratings: {
      technicalSkills: {
        type: Number,
        min: 0,
        max: 5,
      },
      communication: {
        type: Number,
        min: 0,
        max: 5,
      },
      cultureFit: {
        type: Number,
        min: 0,
        max: 5,
      },
      overall: {
        type: Number,
        min: 0,
        max: 5,
      },
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
candidateSchema.index({ source: 1 });
candidateSchema.index({ createdAt: -1 });
candidateSchema.index({ email: 1, phone: 1 });

export const Candidate = model<ICandidate>('Candidate', candidateSchema);

import { Schema, model, Document } from 'mongoose';
import { JobStatus } from '@common/enums';

export interface IJob extends Document {
  title: string;
  description: string;
  requiredSkills: string[];
  preferredSkills: string[];
  minimumExperience: number;
  educationRequirement: string;
  projectRequirement?: string;
  salary?: {
    min: number;
    max: number;
    currency: string;
  };
  location: string;
  jobType: 'full_time' | 'part_time' | 'contract' | 'intern';
  status: JobStatus;
  createdBy: Schema.Types.ObjectId;
  closedAt?: Date;
  publicDescription?: string;
  matchingSummary?: string;
  pineconeEmbedding?: string;
  createdAt: Date;
  updatedAt: Date;
}

const jobSchema = new Schema<IJob>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    requiredSkills: [String],
    preferredSkills: [String],
    minimumExperience: {
      type: Number,
      default: 0,
    },
    educationRequirement: {
      type: String,
      enum: ['high_school', 'bachelors', 'masters', 'phd'],
      default: 'bachelors',
    },
    projectRequirement: String,
    salary: {
      min: Number,
      max: Number,
      currency: {
        type: String,
        default: 'USD',
      },
    },
    location: {
      type: String,
      trim: true,
    },
    jobType: {
      type: String,
      enum: ['full_time', 'part_time', 'contract', 'intern'],
      default: 'full_time',
    },
    status: {
      type: String,
      enum: Object.values(JobStatus),
      default: JobStatus.DRAFT,
      index: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    closedAt: Date,
    publicDescription: String,
    matchingSummary: String,
    pineconeEmbedding: String,
  },
  {
    timestamps: true,
  }
);

// Indexes
jobSchema.index({ status: 1 });
jobSchema.index({ createdBy: 1 });
jobSchema.index({ createdAt: -1 });

export const Job = model<IJob>('Job', jobSchema);

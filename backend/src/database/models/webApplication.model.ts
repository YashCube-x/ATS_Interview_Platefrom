import { Schema, model, Document, Types } from 'mongoose';

export type WebAppStatus = 'new' | 'reviewed' | 'converted' | 'rejected';

export interface IWebApplication extends Document {
  // Basic form fields from the main website
  fullName: string;
  email: string;
  phone?: string;
  positionApplied: string;
  coverLetter?: string;

  // Resume file (uploaded via multipart/form-data)
  resumeUrl?: string;            // Cloudinary URL
  resumeOriginalName?: string;   // Original filename

  // Tracking
  status: WebAppStatus;
  ipAddress?: string;
  referrerUrl?: string;

  // If the application was converted into a full Candidate record
  convertedCandidateId?: Types.ObjectId;
  convertedAt?: Date;

  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

const webApplicationSchema = new Schema<IWebApplication>(
  {
    fullName: {
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
    positionApplied: {
      type: String,
      required: true,
      trim: true,
    },
    coverLetter: {
      type: String,
      trim: true,
    },
    resumeUrl: {
      type: String,
    },
    resumeOriginalName: {
      type: String,
    },
    status: {
      type: String,
      enum: ['new', 'reviewed', 'converted', 'rejected'],
      default: 'new',
      index: true,
    },
    ipAddress: String,
    referrerUrl: String,
    convertedCandidateId: {
      type: Schema.Types.ObjectId,
      ref: 'Candidate',
    },
    convertedAt: Date,
  },
  {
    timestamps: true,
  }
);

webApplicationSchema.index({ createdAt: -1 });
webApplicationSchema.index({ status: 1, createdAt: -1 });

export const WebApplication = model<IWebApplication>('WebApplication', webApplicationSchema);

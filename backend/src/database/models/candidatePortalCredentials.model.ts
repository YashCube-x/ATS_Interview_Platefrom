import { Schema, model, Document } from 'mongoose';

export interface ICandidatePortalCredentials extends Document {
  candidateId: Schema.Types.ObjectId;
  email: string;
  password: string;
  isActive: boolean;
  lastLogin?: Date;
  passwordResetToken?: string;
  passwordResetExpiry?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const candidatePortalCredentialsSchema = new Schema<ICandidatePortalCredentials>(
  {
    candidateId: {
      type: Schema.Types.ObjectId,
      ref: 'Candidate',
      required: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      select: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastLogin: Date,
    passwordResetToken: String,
    passwordResetExpiry: Date,
  },
  {
    timestamps: true,
  }
);

export const CandidatePortalCredentials = model<ICandidatePortalCredentials>(
  'CandidatePortalCredentials',
  candidatePortalCredentialsSchema
);

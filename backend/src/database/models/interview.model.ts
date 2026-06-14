import { Schema, model, Document } from 'mongoose';
import { InterviewStatus, InterviewRound } from '@common/enums';

export interface IInterview extends Document {
  candidateId: Schema.Types.ObjectId;
  jobId: Schema.Types.ObjectId;
  round: InterviewRound;
  status: InterviewStatus;
  scheduledDate: Date;
  duration?: number; // in minutes
  interviewerName?: string;
  interviewerEmail?: string;
  location?: string;
  meetingLink?: string;
  feedback?: string;
  rating?: number;
  notes?: string;
  rescheduleReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

const interviewSchema = new Schema<IInterview>(
  {
    candidateId: {
      type: Schema.Types.ObjectId,
      ref: 'Candidate',
      required: true,
    },
    jobId: {
      type: Schema.Types.ObjectId,
      ref: 'Job',
      required: true,
    },
    round: {
      type: String,
      enum: Object.values(InterviewRound),
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(InterviewStatus),
      default: InterviewStatus.SCHEDULED,
      index: true,
    },
    scheduledDate: {
      type: Date,
      required: true,
    },
    duration: Number,
    interviewerName: String,
    interviewerEmail: String,
    location: String,
    meetingLink: String,
    feedback: String,
    rating: {
      type: Number,
      min: 1,
      max: 5,
    },
    notes: String,
    rescheduleReason: String,
  },
  {
    timestamps: true,
  }
);

// Indexes
interviewSchema.index({ candidateId: 1 });
interviewSchema.index({ jobId: 1 });
interviewSchema.index({ scheduledDate: 1 });

export const Interview = model<IInterview>('Interview', interviewSchema);

import { Schema, model, Document } from 'mongoose';
import { OfferStatus } from '@common/enums';

export interface IOffer extends Document {
  candidateId: Schema.Types.ObjectId;
  jobId: Schema.Types.ObjectId;
  status: OfferStatus;
  salary: {
    amount: number;
    currency: string;
  };
  benefits?: string[];
  startDate: Date;
  expiryDate: Date;
  offerLetter?: string;
  acceptedAt?: Date;
  declinedAt?: Date;
  declineReason?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const offerSchema = new Schema<IOffer>(
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
    status: {
      type: String,
      enum: Object.values(OfferStatus),
      default: OfferStatus.PENDING,
      index: true,
    },
    salary: {
      amount: {
        type: Number,
        required: true,
      },
      currency: {
        type: String,
        default: 'USD',
      },
    },
    benefits: [String],
    startDate: {
      type: Date,
      required: true,
    },
    expiryDate: {
      type: Date,
      required: true,
    },
    offerLetter: String,
    acceptedAt: Date,
    declinedAt: Date,
    declineReason: String,
    notes: String,
  },
  {
    timestamps: true,
  }
);

// Indexes
offerSchema.index({ candidateId: 1 });
offerSchema.index({ jobId: 1 });

export const Offer = model<IOffer>('Offer', offerSchema);

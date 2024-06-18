import { Schema, Document } from 'mongoose';

export enum PaymentPageStatus {
  PUBLISHED = 'published',
  UNPUBLISHED = 'unpublished',
}

export interface IPayment extends Document {
  slug: string;
  amount: number;
  description?: string;
  status: PaymentPageStatus;
}

export const PaymentSchema = new Schema<IPayment>(
  {
    slug: {
      type: String,
      required: true,
      unique: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    description: {
      type: String,
    },
    status: {
      type: String,
      enum: Object.values(PaymentPageStatus),
      default: PaymentPageStatus.PUBLISHED,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
    },
  },
);

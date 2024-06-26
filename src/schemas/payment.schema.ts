import { Schema, Document } from 'mongoose';
import { USER_MODEL } from 'src/constants';

export enum PaymentPageStatus {
  PUBLISHED = 'published',
  UNPUBLISHED = 'unpublished',
}

export interface IPayment extends Document {
  user: Schema.Types.ObjectId;
  slug: string;
  amount: number;
  description?: string;
  status: PaymentPageStatus;
}

export const PaymentSchema = new Schema<IPayment>(
  {
    user: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: USER_MODEL,
    },
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

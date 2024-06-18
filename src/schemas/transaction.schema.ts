import { Schema, Document } from 'mongoose';
import { PAYMENT_MODEL } from 'src/constants';

export enum TransactionStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
}

export enum TransactionType {
  FUND_WITH_FIAT = 'FUND_WITH_FIAT',
  CHECKOUT = 'CHECKOUT',
}

export enum PaymentProvider {
  PAYSTACK = 'PAYSTACK',
}

export interface ITransactionBase extends Document {
  reference: string;
  amount: number;
  status: TransactionStatus;
  type: TransactionType;
  toAddress: string;
}

export interface ICheckout extends ITransactionBase {
  payment?: Schema.Types.ObjectId;
  txHash?: string;
  metadata?: any;
  callbackUrl?: string;
}

export interface IFundWithFiat extends ITransactionBase {
  paymentProvider: PaymentProvider;
}

const CheckoutSchema = new Schema<ICheckout>(
  {
    payment: {
      type: Schema.Types.ObjectId,
      ref: PAYMENT_MODEL,
    },
    txHash: {
      type: String,
    },
    metadata: {
      type: Schema.Types.Mixed,
    },
    callbackUrl: {
      type: String,
    },
  },
  {
    _id: false,
  },
);

const FundWithFiatSchema = new Schema<IFundWithFiat>(
  {
    paymentProvider: {
      type: String,
      enum: Object.values(PaymentProvider),
    },
  },
  {
    _id: false,
  },
);

export const TransactionBaseSchema = new Schema<ITransactionBase>(
  {
    reference: {
      type: String,
      required: true,
      unique: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(TransactionStatus),
      default: TransactionStatus.PENDING,
    },
    type: {
      type: String,
      enum: Object.values(TransactionType),
      required: true,
    },
    toAddress: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
    },
    discriminatorKey: 'type',
  },
);

const path = TransactionBaseSchema;

export const CheckoutTransactionModel = path.discriminator<
  typeof CheckoutSchema
>(TransactionType.CHECKOUT, CheckoutSchema);

export const FundWithFiatTransactionModel = path.discriminator<
  typeof FundWithFiatSchema
>(TransactionType.FUND_WITH_FIAT, FundWithFiatSchema);

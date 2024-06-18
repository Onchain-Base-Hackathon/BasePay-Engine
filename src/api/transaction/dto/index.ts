import {
  IsEnum,
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
} from 'class-validator';
import {
  PaymentProvider,
  TransactionStatus,
} from 'src/schemas/transaction.schema';

export class WebhookDto<T> {
  @IsString()
  @IsNotEmpty()
  event: string;

  @IsNotEmpty()
  data: T;
}

export class InitializeTransactionDto {
  @IsNumber()
  amount: number;

  @IsOptional()
  @IsMongoId()
  payment: string;

  @IsOptional()
  @IsObject()
  metadata: Record<string, any>;

  @IsOptional()
  @IsString()
  callbackUrl: string;

  @IsOptional()
  @IsString()
  reference: string;
}

export class InitializeFundWithFiatTransactionDto {
  @IsNumber()
  amount: number;

  @IsString()
  cryptoAmount: string;

  @IsEnum(PaymentProvider)
  paymentProvider: PaymentProvider;

  @IsString()
  address: string;

  @IsOptional()
  @IsString()
  callbackUrl: string;

  @IsOptional()
  @IsString()
  reference: string;
}

export class CompleteCheckoutTransactionDto {
  @IsString()
  @IsNotEmpty()
  reference: string;

  @IsString()
  @IsNotEmpty()
  txHash: string;

  @IsEnum(TransactionStatus)
  @IsNotEmpty()
  status: TransactionStatus;

  @IsOptional()
  @IsString()
  fromAddress: string;
}

export type PaystackTransactionPayload = {
  reference?: string;
  amount: number;
  email: string;
  metadata?: any;
  currency?: string;
  callback_url?: string;
  channels?: string[];
  authorization_code?: string;
};

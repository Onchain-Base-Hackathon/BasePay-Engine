import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Configs } from 'src/constants/config.enum';
import crypto from 'crypto';
import {
  CompleteCheckoutTransactionDto,
  InitializeFundWithFiatTransactionDto,
  InitializeTransactionDto,
  PaystackTransactionPayload,
  WebhookDto,
} from './dto';
import { InjectModel } from '@nestjs/mongoose';
import { TRANSACTION_MODEL } from 'src/constants';
import {
  ICheckout,
  ITransactionBase,
  TransactionStatus,
  TransactionType,
} from 'src/schemas/transaction.schema';
import { Model } from 'mongoose';
import {
  BasecanExplorerProvider,
  PaystackPaymentProvider,
} from 'src/providers';

@Injectable()
export class TransactionService {
  constructor(
    private readonly configService: ConfigService,
    @InjectModel(TRANSACTION_MODEL)
    private readonly transactionModel: Model<ITransactionBase & ICheckout>,
    private readonly paystackPaymentProvider: PaystackPaymentProvider,
    private readonly basecanExplorerProvider: BasecanExplorerProvider,
  ) {}

  async initializeTransaction(address: string, dto: InitializeTransactionDto) {
    let { amount, payment, metadata, callbackUrl, reference } = dto;

    // set default values
    metadata = metadata || {};
    callbackUrl = callbackUrl || '';
    reference = reference || this.generateRandomReference();

    // validate amount
    if (amount <= 0) {
      throw new BadRequestException('Invalid amount');
    }

    // create transaction
    const transaction = await this.transactionModel.create({
      amount,
      reference,
      type: TransactionType.CHECKOUT,
      callbackUrl,
      metadata,
      payment,
      toAddress: address,
    });

    const authorizationUrl =
      this.configService.get(Configs.CHECKOUT_BASE_URL) + transaction.reference;

    return {
      message: 'Transaction initialized successfully',
      success: true,
      data: {
        reference: transaction.reference,
        authorizationUrl,
      },
    };
  }

  async initializeFundWithFiatTransaction(
    dto: InitializeFundWithFiatTransactionDto,
  ) {
    let { amount, paymentProvider, callbackUrl, reference, address } = dto;

    // set default values
    callbackUrl = callbackUrl || '';
    reference = reference || this.generateRandomReference();

    // create transaction
    const transaction = await this.transactionModel.create({
      amount,
      reference,
      type: TransactionType.FUND_WITH_FIAT,
      paymentProvider,
      toAddress: address,
    });

    const metadata = {
      type: 'FundWallet',
      address,
      tnxId: transaction._id,
    };

    const paystackPayload: PaystackTransactionPayload = {
      reference: reference,
      amount: amount,
      email: '',
      metadata: metadata,
      currency: 'NGN',
      callback_url: callbackUrl,
      channels: [],
    };

    const response = await this.paystackPaymentProvider.init(paystackPayload);

    return {
      message: 'Transaction initialized successfully',
      success: true,
      data: response,
    };
  }

  async updateTxStatus(dto: CompleteCheckoutTransactionDto) {
    const { reference, txHash } = dto;

    const transaction = await this.transactionModel.findOne({
      reference,
      type: TransactionType.CHECKOUT,
    });

    if (!transaction) {
      throw new NotFoundException('Transaction not found');
    }

    if (transaction.status === TransactionStatus.COMPLETED)
      throw new BadRequestException('Transaction already completed');

    // check txHash
    const receipt = await this.basecanExplorerProvider.getTxReceipt(txHash);

    let status = TransactionStatus.COMPLETED;
    if (receipt.result.status !== 1) {
      status = TransactionStatus.FAILED;
    }

    // update transaction
    const updatedTransaction = await this.transactionModel.findByIdAndUpdate(
      transaction._id,
      {
        status,
        txHash: txHash,
      },
      { new: true },
    );

    return {
      message: 'Transaction updated successfully',
      success: true,
      data: updatedTransaction,
    };
  }

  //////////////////////////////
  // Webhooks
  //////////////////////////////
  async paystackWebhook(dto: WebhookDto<any>, headers) {
    const hash = crypto
      .createHmac('sha512', this.configService.get(Configs.PAYSTACK_SECRET_KEY))
      .update(JSON.stringify(dto))
      .digest('hex');

    if (hash !== headers['x-paystack-signature']) return false;

    if (dto.event === 'charge.success') {
      switch (dto.data.metadata.type) {
        case 'FundWallet':
          const payload = {
            address: dto.data.metadata.address,
            reference: dto.data.reference,
            amount: dto.data.amount / 100,
          };
          await this.handleWalletFund(payload);
          break;
      }
    }

    return true;
  }

  //////////////////////////////
  // Utilities
  //////////////////////////////
  private generateRandomReference() {
    return crypto.randomBytes(16).toString('hex');
  }

  private async handleWalletFund(dto: {
    address: string;
    reference: string;
    amount: number;
  }) {
    return {
      message: 'Wallet funded successfully',
    };
  }
}

import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Configs } from 'src/constants/config.enum';
import { randomBytes, createHmac } from 'crypto';
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
import { PaystackPaymentProvider } from 'src/providers';
import { EthereumProvider } from 'src/providers';
import { ethers } from 'ethers';

@Injectable()
export class TransactionService {
  constructor(
    private readonly configService: ConfigService,
    @InjectModel(TRANSACTION_MODEL)
    private readonly transactionModel: Model<ITransactionBase & ICheckout>,
    private readonly paystackPaymentProvider: PaystackPaymentProvider,
    private readonly ethereumProvider: EthereumProvider,
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
    let {
      amount,
      paymentProvider,
      callbackUrl,
      reference,
      address,
      cryptoAmount,
    } = dto;

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
      cryptoAmount,
    };

    const paystackPayload: PaystackTransactionPayload = {
      reference: reference,
      amount: amount,
      email: '',
      metadata: metadata,
      currency: 'NGN',
      callback_url: callbackUrl,
    };

    const response = await this.paystackPaymentProvider.init(paystackPayload);

    return {
      message: 'Transaction initialized successfully',
      success: true,
      data: response,
    };
  }

  async updateTxStatus(dto: CompleteCheckoutTransactionDto) {
    const { reference, txHash, fromAddress } = dto;
    let { status: txStatus } = dto;

    const transaction = await this.transactionModel.findOne({
      reference,
      type: TransactionType.CHECKOUT,
    });

    if (!transaction) {
      throw new NotFoundException('Transaction not found');
    }

    if (transaction.status === TransactionStatus.SUCCESSFUL)
      throw new BadRequestException('Transaction already completed');

    let updatedTransaction;
    switch (txStatus) {
      case TransactionStatus.SUCCESSFUL: {
        const provider =
          this.ethereumProvider.getProviderOrSigner<ethers.AbstractProvider>();
        const txResponse = await provider.getTransaction(txHash);

        if (
          transaction.toAddress !== txResponse.to ||
          fromAddress !== txResponse.from
        ) {
          txStatus = TransactionStatus.FAILED;
        }

        // update transaction
        updatedTransaction = await this.transactionModel.findByIdAndUpdate(
          transaction._id,
          {
            status: txStatus,
            txHash,
          },
          { new: true },
        );

        break;
      }
      case TransactionStatus.FAILED: {
        updatedTransaction = await this.transactionModel.findByIdAndUpdate(
          transaction._id,
          {
            status: txStatus,
            txHash,
          },
          { new: true },
        );

        break;
      }
      default:
        throw new BadRequestException('Invalid status');
    }

    ///TODO: send webhook / email / inapp

    return {
      message: 'Transaction updated successfully',
      success: true,
      data: updatedTransaction,
    };
  }

  async getPoolBalance() {
    const provider =
      this.ethereumProvider.getProviderOrSigner<ethers.AbstractProvider>();

    const balance = await provider.getBalance(
      this.configService.get(Configs.POOL_WALLET_ADDRESS),
    );

    return {
      message: 'Pool balance fetched successfully',
      success: true,
      data: ethers.formatEther(balance),
    };
  }

  //////////////////////////////
  // Webhooks
  //////////////////////////////
  async paystackWebhook(dto: WebhookDto<any>, headers) {
    const hash = createHmac(
      'sha512',
      this.configService.get(Configs.PAYSTACK_SECRET_KEY),
    )
      .update(JSON.stringify(dto))
      .digest('hex');

    if (hash !== headers['x-paystack-signature']) return false;

    if (dto.event === 'charge.success') {
      switch (dto.data.metadata.type) {
        case 'FundWallet': {
          const payload = {
            address: dto.data.metadata.address,
            amount: dto.data.metadata.cryptoAmount,
            reference: dto.data.reference,
          };
          await this.handleWalletFund(payload);
          break;
        }
      }
    }

    return true;
  }

  //////////////////////////////
  // Utilities
  //////////////////////////////
  private generateRandomReference() {
    return randomBytes(16).toString('hex');
  }

  private async handleWalletFund(data: any) {
    // get transaction
    const transaction = await this.transactionModel.findOne({
      reference: data.reference,
    });

    if (!transaction) {
      throw new NotFoundException('Transaction not found');
    }

    // update transaction
    await this.transactionModel.findOneAndUpdate(
      {
        reference: data.reference,
      },
      {
        status: TransactionStatus.SUCCESSFUL,
      },
      { new: true },
    );

    // send crypto to wallet
    const signer =
      this.ethereumProvider.getProviderOrSigner<ethers.Wallet>(true);

    const tx = await signer.sendTransaction({
      to: data.address,
      value: ethers.parseEther(data.amount.toString()),
    });

    await tx.wait();

    return {
      message: 'Wallet funded successfully',
    };
  }
}

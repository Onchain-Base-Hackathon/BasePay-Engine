import {
  Body,
  Controller,
  Get,
  Headers,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { TransactionService } from './transaction.service';
import { UserGuard } from 'src/guards';
import { GetUser } from 'src/decorators';
import {
  CompleteCheckoutTransactionDto,
  InitializeFundWithFiatTransactionDto,
  InitializeTransactionDto,
  WebhookDto,
} from './dto';

@Controller('transaction')
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) {}

  @Post('initialize')
  @UseGuards(UserGuard)
  async initializeTransaction(
    @GetUser('address') address: string,
    @Body() dto: InitializeTransactionDto,
  ) {
    const data = await this.transactionService.initializeTransaction(
      address,
      dto,
    );

    return data;
  }

  @Post('fundWithFiat/initialize')
  async initializeFundWithFiatTransaction(
    @Body() dto: InitializeFundWithFiatTransactionDto,
  ) {
    const data =
      await this.transactionService.initializeFundWithFiatTransaction(dto);

    return data;
  }

  @Put('update')
  async updateTxStatus(@Body() dto: CompleteCheckoutTransactionDto) {
    const data = await this.transactionService.updateTxStatus(dto);

    return data;
  }

  @Get('pool/balance')
  async getPoolBalance() {
    const data = await this.transactionService.getPoolBalance();

    return data;
  }

  @Post('paystack/webhook')
  async paystackWebhook(
    @Body() dto: WebhookDto<any>,
    @Headers() headers: Record<string, any>,
  ) {
    const checked = await this.transactionService.paystackWebhook(dto, headers);
    if (checked) {
      return {
        status: true,
      };
    }
  }

  @Get('user-transactions')
  @UseGuards(UserGuard)
  async getUserTransactions(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @GetUser('address') address: string,
  ) {
    const data = await this.transactionService.getUserTransactions(
      page,
      limit,
      address,
    );
    return data;
  }
}

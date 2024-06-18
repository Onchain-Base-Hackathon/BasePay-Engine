import { Body, Controller, Post, Put, UseGuards } from '@nestjs/common';
import { TransactionService } from './transaction.service';
import { UserGuard } from 'src/guards';
import { GetUser } from 'src/decorators';
import {
  CompleteCheckoutTransactionDto,
  InitializeFundWithFiatTransactionDto,
  InitializeTransactionDto,
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
    const data = this.transactionService.initializeTransaction(address, dto);

    return data;
  }

  @Post('fundWithFiat/initialize')
  async initializeFundWithFiatTransaction(
    @Body() dto: InitializeFundWithFiatTransactionDto,
  ) {
    const data = this.transactionService.initializeFundWithFiatTransaction(dto);

    return data;
  }

  @Put('update')
  async updateTxStatus(@Body() dto: CompleteCheckoutTransactionDto) {
    const data = this.transactionService.updateTxStatus(dto);

    return data;
  }
}

import { PaymentService } from './payment.service';
import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { UserGuard } from 'src/guards';
import { GetUser } from 'src/decorators';
import { CreatePaymentDto } from './dto';

@Controller('payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post('createPaymentLink')
  @UseGuards(UserGuard)
  async createPayment(
    @Body() dto: CreatePaymentDto,
    @GetUser('id') user: string,
  ) {
    const data = await this.paymentService.createPaymentLink(dto, user);
    return data;
  }

  @Get('userPaymentLinks')
  @UseGuards(UserGuard)
  async userPaymentLinks(
    @GetUser('id') user: string,
  ) {
    const data = await this.paymentService.userPaymentLinks(user);
    return data;
  }

  @Get('paymentLinkDetails')
  async paymentLinkDetails(@Query('slug') slug: string) {
    const data = await this.paymentService.paymentLinkDetails(slug);
    return data;
  }
}

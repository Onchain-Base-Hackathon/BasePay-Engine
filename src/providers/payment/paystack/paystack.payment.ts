import { Injectable } from '@nestjs/common';
import { Configs } from 'src/constants/config.enum';
import axios from 'axios';
import { ConfigService } from '@nestjs/config';
import { PaystackTransactionPayload } from 'src/api/transaction/dto';

@Injectable()
export class PaystackPaymentProvider {
  constructor(private readonly configService: ConfigService) {}

  async init(payload: PaystackTransactionPayload) {
    const url: string =
      this.configService.get(Configs.STRIPE_BASE_URL) +
      '/transaction/initialize/';
    const amount = (payload.amount * 100).toString(); // convert to kobo

    const { data, status } = await axios.post(
      url,
      {
        email: payload.email,
        amount: amount,
        reference: payload.reference,
        metadata: payload.metadata,
        callback_url: payload.callback_url,
        currency: payload.currency,
        channels: payload.channels || ['card', 'bank'],
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          Authorization: `Bearer ${this.configService.get(Configs.STRIPE_SECRET_KEY)}`,
        },
      },
    );
    if (status === 200) return data;
    return null;
  }

  async detail(transactionId: number) {
    // Get payment details
    const url =
      this.configService.get(Configs.STRIPE_BASE_URL) +
      `/transaction/${transactionId}`;
    const { data, status } = await axios.get(url, {
      headers: {
        Accept: 'application/json',
        Authorization: ` Bearer ${this.configService.get(Configs.STRIPE_SECRET_KEY)}`,
      },
    });
    return data;
  }
}

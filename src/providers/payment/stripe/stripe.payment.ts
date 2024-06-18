import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Configs } from 'src/constants/config.enum';
import axios from 'axios';

@Injectable()
export class StripePaymentProvider {
  constructor(private readonly configService: ConfigService) {}

  async createOnrampSession(data: any) {
    try {
      const url: string =
        this.configService.get(Configs.STRIPE_BASE_URL) +
        'crypto/onramp_sessions';

      data = new URLSearchParams(data);

      const response = await axios.post(url, data, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        auth: {
          username: this.configService.get(Configs.STRIPE_SECRET_KEY),
          password: '',
        },
      });

      if (response.status === 200) return response.data;
    } catch (error) {
      console.log(error);
      throw new BadRequestException(error, error);
    }
  }
}

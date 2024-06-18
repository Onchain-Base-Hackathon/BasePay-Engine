import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Configs } from 'src/constants';
import axios from 'axios';

@Injectable()
export class BasecanExplorerProvider {
  constructor(private readonly configService: ConfigService) {}

  async getTxReceipt(txHash: string) {
    try {
      const url: string =
        this.configService.get(Configs.BASESCAN_BASE_URL) +
        'transaction/' +
        txHash;

      const response = await axios.get(url, {
        params: {
          module: 'transaction',
          action: 'gettxreceiptstatus',
          txhash: txHash,
          apikey: this.configService.get(Configs.BASESCAN_API_KEY),
        },
      });

      if (response.status === 200) return response.data;
    } catch (error) {
      console.log(error);
      throw new BadRequestException(error, error);
    }
  }
}

import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ethers } from 'ethers';
import { Configs } from 'src/constants';

@Injectable()
export class EthereumProvider {
  private provider: ethers.AbstractProvider;

  constructor(private readonly configService: ConfigService) {
    this.provider = new ethers.JsonRpcProvider(
      configService.get(Configs.NETWORK_RPC_URL),
    );
  }

  getProviderOrSigner<T>(needSigner: boolean = false): T {
    if (needSigner) {
      return new ethers.Wallet(
        this.configService.get(Configs.POOL_WALLET_PRIVATE_KEY),
        this.provider,
      ) as T;
    }
    return this.provider as T;
  }
}

import { createHmac } from 'crypto';
import { Configs } from 'src/constants';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class Encryptor {
  constructor(private readonly configService: ConfigService) {}

  hashText(data: string): string {
    const hmac = createHmac(
      'sha256',
      this.configService.get(Configs.ENCRYPT_SECRET),
    );
    return hmac.update(data).digest('hex').replaceAll(':', '');
  }

  verify(data: string, hash: string): boolean {
    const calculatedHash = this.hashText(data);
    return calculatedHash.replaceAll(':', '') === hash;
  }
}

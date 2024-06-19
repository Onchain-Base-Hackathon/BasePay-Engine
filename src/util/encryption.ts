import { randomBytes, createCipheriv, createDecipheriv } from 'crypto';
import { Configs } from 'src/constants';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class Encryptor {
  constructor(private readonly configService: ConfigService) {}

  encrypt(text: string | Buffer) {
    const iv = randomBytes(16);
    let cipher = createCipheriv(
      this.configService.get(Configs.ENCRYPT_ALGORITHM),
      Buffer.from(this.configService.get(Configs.ENCRYPT_SECRET)),
      iv,
    );
    let encrypted = cipher.update(text);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return `${iv.toString('hex')}-${encrypted.toString('hex')}`;
  }

  decrypt(text: string) {
    let textParts = text.split('-') ?? [];
    let iv = Buffer.from(textParts.shift() ?? '', 'hex');
    let encryptedText = Buffer.from(textParts.join(':'), 'hex');
    let decipher = createDecipheriv(
      this.configService.get(Configs.ENCRYPT_ALGORITHM),
      Buffer.from(this.configService.get(Configs.ENCRYPT_SECRET)),
      iv,
    );
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
  }
}

import crypto from 'crypto';
import { Configs } from 'src/constants';
import { Injectable } from '@nestjs/common';

@Injectable()
export class Encryptor {
  encrypt(text: string | Buffer) {
    const iv = crypto.randomBytes(16);
    let cipher = crypto.createCipheriv(
      Configs.ENCRYPT_ALGORITHM,
      Buffer.from(Configs.ENCRYPT_SECRET),
      iv,
    );
    let encrypted = cipher.update(text);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return `${iv.toString('hex')}:${encrypted.toString('hex')}`;
  }

  decrypt(text: string) {
    let textParts = text.split(':') ?? [];
    let iv = Buffer.from(textParts.shift() ?? '', 'hex');
    let encryptedText = Buffer.from(textParts.join(':'), 'hex');
    let decipher = crypto.createDecipheriv(
      Configs.ENCRYPT_ALGORITHM,
      Buffer.from(Configs.ENCRYPT_SECRET),
      iv,
    );
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
  }
}

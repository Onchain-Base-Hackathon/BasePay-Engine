import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto';
import { Model } from 'mongoose';
import { IUser } from 'src/schemas/user.schema';
import { Encryptor } from 'src/util/encryption';
import { USER_MODEL } from 'src/constants';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(USER_MODEL)
    private readonly userModel: Model<IUser>,
    private readonly encryptor: Encryptor,
  ) {}

  async connectUser(dto: CreateUserDto) {
    const { address } = dto;
    let user = await this.userModel.findOne({ address });
    if (!user) {
      const apiKey = this.encryptor.encrypt(address);
      user = await this.userModel.create({ address, apiKey });
      if (!user)
        throw new BadRequestException('Failed to connect wallet, please retry');
    }
    return {
      message: 'Wallet connected successfully',
      success: true,
      data: { user },
    };
  }
}

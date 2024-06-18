import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { USER_MODEL } from 'src/constants';
import { UserSchema } from 'src/schemas/user.schema';
import { UserController } from './user.controller';
import { UserService } from './user.service';

const ModelModule = MongooseModule.forFeatureAsync([
  {
    name: USER_MODEL,
    useFactory: () => UserSchema,
  },
]);

@Module({
  imports: [ModelModule],
  controllers: [UserController],
  providers: [UserService],
  exports: [ModelModule],
})
export class UserModule {}

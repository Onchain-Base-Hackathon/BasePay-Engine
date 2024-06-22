import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PAYMENT_MODEL, USER_MODEL } from 'src/constants';
import { PaymentSchema } from 'src/schemas/payment.schema';
import { PaymentController } from './payment.controller';
import { PaymentService } from './payment.service';
import { UserSchema } from 'src/schemas/user.schema';

const ModelModule = MongooseModule.forFeatureAsync([
  {
    name: PAYMENT_MODEL,
    useFactory: () => PaymentSchema,
  },
]);

@Module({
  imports: [
    ModelModule,
    MongooseModule.forFeatureAsync([
      {
        name: USER_MODEL,
        useFactory: () => UserSchema,
      },
    ]),
  ],
  controllers: [PaymentController],
  providers: [PaymentService],
  exports: [ModelModule],
})
export class PaymentModule {}

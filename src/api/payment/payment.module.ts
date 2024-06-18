import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PAYMENT_MODEL } from 'src/constants';
import { PaymentSchema } from 'src/schemas/payment.schema';
import { PaymentController } from './payment.controller';
import { PaymentService } from './payment.service';

@Module({
  imports: [
    MongooseModule.forFeatureAsync([
      {
        name: PAYMENT_MODEL,
        useFactory: () => PaymentSchema,
      },
    ]),
  ],
  controllers: [PaymentController],
  providers: [PaymentService],
})
export class PaymentModule {}

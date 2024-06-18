import { Module } from '@nestjs/common';
import { TransactionController } from './transaction.controller';
import { TransactionService } from './transaction.service';
import { MongooseModule } from '@nestjs/mongoose';
import { TRANSACTION_MODEL } from 'src/constants';
import { TransactionBaseSchema } from 'src/schemas/transaction.schema';
import { UserModule } from '../user/user.module';

const ModelModule = MongooseModule.forFeatureAsync([
  {
    name: TRANSACTION_MODEL,
    useFactory: () => TransactionBaseSchema,
  },
]);

@Module({
  imports: [ModelModule, UserModule],
  exports: [ModelModule],
  controllers: [TransactionController],
  providers: [TransactionService],
})
export class TransactionModule {}

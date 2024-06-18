import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Configs } from './constants/config.enum';
import { MongooseModule } from '@nestjs/mongoose';
import { PaystackPaymentProvider } from './providers/payment/paystack/paystack.payment';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        return {
          uri: configService.get(Configs.MONGO_DB_URI),
        };
      },
    }),
  ],
  controllers: [AppController],
  providers: [PaystackPaymentProvider],
})
export class AppModule {}

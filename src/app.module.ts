import { Global, Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Configs } from './constants/config.enum';
import { MongooseModule } from '@nestjs/mongoose';
import { PaystackPaymentProvider } from './providers';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { ErrorInterceptor, HttpExceptionFilter } from './util';
import { UserModule } from './api/user/user.module';
import { TransactionModule } from './api';
import { PaymentModule } from './api/payment/payment.module';
import { EthereumProvider } from './providers/ethereum.provider';
import { Encryptor } from './util/encryption';

const globalProviders = [PaystackPaymentProvider, EthereumProvider, Encryptor];

@Global()
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
    UserModule,
    TransactionModule,
    PaymentModule,
  ],
  controllers: [AppController],
  providers: [
    ...globalProviders,
    {
      provide: APP_INTERCEPTOR,
      useClass: ErrorInterceptor,
    },

    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
  ],
  exports: [...globalProviders],
})
export class AppModule {}

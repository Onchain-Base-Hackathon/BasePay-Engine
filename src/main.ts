import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';
import { Configs } from './constants/config.enum';
import { ValidationPipe } from '@nestjs/common';
import morgan = require('morgan');
import helmet from 'helmet';

let port: number;
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      disableErrorMessages: false,
    }),
  );

  app.enableCors({
    origin: '*',
    credentials: true,
  });

  app.setGlobalPrefix('api');

  app.use(morgan('dev'));
  app.use(
    helmet({
      contentSecurityPolicy: undefined,
      crossOriginEmbedderPolicy: undefined,
    }),
  );

  port = configService.get(Configs.PORT);
  await app.listen(port);
}

bootstrap().then(() => {
  console.info(`
     ------------
     Internal Application Started!
     API: http://localhost:${port}/api
     ------------
`);
});

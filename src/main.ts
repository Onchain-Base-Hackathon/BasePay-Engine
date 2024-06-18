import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';
import { Configs } from './constants/config.enum';
import { ValidationPipe } from '@nestjs/common';

let port: number;
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
    }),
  );

  app.enableCors({
    origin: '*',
    credentials: true,
  });

  app.setGlobalPrefix('v1');

  port = configService.get(Configs.PORT);
  await app.listen(3000);
}

bootstrap().then(() => {
  console.info(`
     ------------
     Internal Application Started!
     API: http://localhost:${port}/v1
     ------------
`);
});

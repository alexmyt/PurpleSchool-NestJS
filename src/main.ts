import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { IConfig } from './lib/config/config.interface';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService<IConfig>);

  app.useGlobalPipes(new ValidationPipe({ transform: true }));
  const port = process.env.PORT || configService.getOrThrow('app.port', { infer: true });

  await app.listen(port);
}
bootstrap();

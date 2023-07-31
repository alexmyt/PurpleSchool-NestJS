import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Logger } from 'nestjs-pino';

import { IConfig } from './lib/config/config.interface';
import { AppUtils } from './common/app.utils';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  app.useLogger(app.get(Logger));

  const configService = app.get(ConfigService<IConfig>);

  app.useGlobalPipes(new ValidationPipe(AppUtils.validationPipeOptions()));

  const port = process.env.PORT || configService.getOrThrow('app.port', { infer: true });

  await app.listen(port);
}
bootstrap();

import { Module } from '@nestjs/common';
import { LoggerModule } from 'nestjs-pino';

const redactFields = ['req.headers.authorization', 'req.body.password', 'req.body.hashedPassword'];
const basePinoOptions = {
  translateTime: true,
  ignore: 'pid,hostname',
  singleLine: true,
  redact: ['*.password', '*.hashedPassword'],
};

@Module({
  imports: [
    LoggerModule.forRootAsync({
      useFactory: () => ({
        pinoHttp: {
          timestamp: () => `,"timestamp":"${new Date(Date.now()).toISOString()}"`,
          redact: {
            paths: redactFields,
            censor: '**GDPR COMPLIANT**',
          },
          transport: {
            targets: [
              {
                target: 'pino-pretty',
                level: 'info', // log only info and above to console
                options: {
                  ...basePinoOptions,
                  colorize: true,
                },
              },
            ],
          },
        },
      }),
    }),
  ],
  exports: [LoggerModule],
})
export class PinoLoggerModule {}

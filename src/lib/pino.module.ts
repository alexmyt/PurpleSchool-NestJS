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
      useFactory: () => {
        const isProdEnv = process.env.NODE_ENV && process.env.NODE_ENV.startsWith('prod');
        const isTestEnv = process.env.NODE_ENV && process.env.NODE_ENV.startsWith('test');

        return {
          pinoHttp: {
            timestamp: () => `,"timestamp":"${new Date(Date.now()).toISOString()}"`,
            redact: {
              paths: redactFields,
              censor: '**CENSORED**',
            },
            transport: isTestEnv
              ? undefined
              : isProdEnv
              ? {
                  target: 'pino/file',
                  level: 'error', // log only errors to file
                  options: {
                    ...basePinoOptions,
                    destination: 'app.log',
                    mkdir: true,
                    sync: false,
                  },
                }
              : {
                  targets: [
                    {
                      target: 'pino-pretty',
                      level: 'info', // log only info and above to console
                      options: {
                        ...basePinoOptions,
                        colorize: true,
                      },
                    },
                    {
                      target: 'pino/file',
                      level: 'error', // log only errors to file
                      options: {
                        ...basePinoOptions,
                        destination: 'app.log',
                        mkdir: true,
                        sync: false,
                      },
                    },
                  ],
                },
            level: isTestEnv ? 'silent' : 'info',
          },
        };
      },
    }),
  ],
  exports: [LoggerModule],
})
export class PinoLoggerModule {}

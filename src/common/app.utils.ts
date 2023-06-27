import { ValidationPipeOptions } from '@nestjs/common';

export const AppUtils = {
  validationPipeOptions(): ValidationPipeOptions {
    return {
      transform: true,
      whitelist: true,
      enableDebugMessages: !process.env.NODE_ENV || process.env.NODE_ENV.startsWith('dev'),
    };
  },
};

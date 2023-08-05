import { ValidationPipeOptions } from '@nestjs/common';

export const AppUtils = {
  validationPipeOptions(pipeOptions?: ValidationPipeOptions): ValidationPipeOptions {
    return {
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
      ...pipeOptions,
    };
  },
};

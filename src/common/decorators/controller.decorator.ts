import { Controller, applyDecorators } from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiBadRequestResponse,
} from '@nestjs/swagger';

export const GenericController = (name: string, isSecuredRoute = true): ClassDecorator => {
  const decorators: (ClassDecorator | MethodDecorator | PropertyDecorator)[] = [
    ApiTags(name),
    ApiBadRequestResponse({ description: 'Bad request' }),
    Controller(name),
  ];

  if (isSecuredRoute) {
    decorators.push(ApiBearerAuth());
    decorators.push(ApiForbiddenResponse({ description: 'Forbidden' }));
  }

  return applyDecorators(...decorators);
};

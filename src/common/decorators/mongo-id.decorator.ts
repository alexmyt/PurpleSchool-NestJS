import { Param, PipeTransform, Type } from '@nestjs/common';

import { MongoIdValidationPipe } from '../pipes/mongo-id-validation.pipe';

export const MongoIdParam = (
  property: string,
  ...pipes: Array<Type<PipeTransform> | PipeTransform>
) => {
  return Param(property, MongoIdValidationPipe, ...pipes);
};

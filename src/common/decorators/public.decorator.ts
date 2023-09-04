import { SetMetadata, applyDecorators } from '@nestjs/common';

import { IS_PUBLIC_KEY } from '../constants';

const PublicAuthMiddleware = SetMetadata(IS_PUBLIC_KEY, true);
const PublicAuthSwagger = SetMetadata('swagger/apiSecurity', [IS_PUBLIC_KEY]);

export const Public = () => applyDecorators(PublicAuthMiddleware, PublicAuthSwagger);

import { SetMetadata } from '@nestjs/common';

import { UserRole } from '../permission.enum';
import { ROLES_KEY } from '../constants';

export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);

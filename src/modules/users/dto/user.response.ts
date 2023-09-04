import { ApiProperty } from '@nestjs/swagger';

import { UserRole } from '../../../common/permission.enum';

export class UserResponseDto {
  _id: string;
  createdAt: Date;
  updatedAt: Date;
  email: string;
  @ApiProperty({ enum: UserRole, enumName: 'userRole' })
  role: UserRole;
  phone: string;
  isDeleted: boolean;
}

import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString } from 'class-validator';

export class UserLoginDTO {
  /**
   * User email
   * @example 'user@mail.dot'
   */
  @ApiProperty({ description: 'User email' })
  @IsEmail()
  email: string;

  /**
   * User password
   * @example 'Pa$$w0rd'
   */
  @ApiProperty()
  @IsString()
  password: string;
}

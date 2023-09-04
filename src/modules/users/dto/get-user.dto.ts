import { ApiProperty } from '@nestjs/swagger';
import { IsMongoId } from 'class-validator';

export class GetUserDto {
  @ApiProperty({ required: true, description: 'User ID, must be a valid MongoID' })
  @IsMongoId()
  id: string;
}

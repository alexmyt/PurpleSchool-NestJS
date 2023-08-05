import { IsMongoId } from 'class-validator';

export class GetUserDto {
  @IsMongoId()
  id: string;
}

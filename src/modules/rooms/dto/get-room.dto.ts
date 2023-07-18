import { IsMongoId } from 'class-validator';

export class GetRoomDto {
  @IsMongoId()
  id: string;
}

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Document } from 'mongoose';

export type RoomModelDocument = HydratedDocument<RoomModel>;

export enum RoomType {
  APARTMENT = 'apartment',
  ROOM = 'room',
}

@Schema({ timestamps: true })
export class RoomModel extends Document {
  @Prop({ required: true })
  name: string;

  @Prop({ enum: RoomType, default: RoomType.APARTMENT })
  type: RoomType;

  @Prop({ required: true })
  capacity: number;

  @Prop()
  amenities: string[];

  @Prop({ required: true })
  price: number;

  @Prop({ index: true })
  isDeleted: boolean;
}

export const RoomModelSchema = SchemaFactory.createForClass(RoomModel);

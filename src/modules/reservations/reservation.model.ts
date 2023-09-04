import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongoSchema } from 'mongoose';

export type ReservationModelDocument = HydratedDocument<ReservationModel>;

@Schema({ timestamps: true })
export class ReservationModel {
  @Prop({ type: MongoSchema.Types.ObjectId, ref: 'RoomModel', required: true })
  roomId: string;

  @Prop({ required: true })
  rentedFrom: Date;

  @Prop({ required: true })
  rentedTo: Date;

  @Prop({ type: MongoSchema.Types.ObjectId, ref: 'UserModel', required: true })
  userId: string;

  @Prop({ default: false })
  isCanceled: boolean;
}

export const ReservationModelSchema = SchemaFactory.createForClass(ReservationModel);

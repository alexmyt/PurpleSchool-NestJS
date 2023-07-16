import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongoSchema } from 'mongoose';

export type ReservationModelDocument = HydratedDocument<ReservationModel>;

@Schema({ timestamps: true })
export class ReservationModel {
  @Prop({ ref: 'RoomModel', required: true })
  roomId: MongoSchema.Types.ObjectId;

  @Prop({ required: true })
  rentedFrom: Date;

  @Prop({ required: true })
  rentedTo: Date;

  @Prop({ ref: 'UserModel', required: true })
  userId: MongoSchema.Types.ObjectId;

  @Prop({ default: false })
  isCanceled: boolean;
}

export const ReservationModelSchema = SchemaFactory.createForClass(ReservationModel);

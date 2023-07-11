import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Document, Types } from 'mongoose';

export type ReservationModelDocument = HydratedDocument<ReservationModel>;

@Schema({ timestamps: true })
export class ReservationModel extends Document {
  @Prop({ type: Types.ObjectId, ref: 'RoomModel', required: true })
  roomId: string;

  @Prop({ required: true })
  rentedFrom: Date;

  @Prop({ required: true })
  rentedTo: Date;

  @Prop({ default: false })
  isCanceled: boolean;
}

export const ReservationModelSchema = SchemaFactory.createForClass(ReservationModel);

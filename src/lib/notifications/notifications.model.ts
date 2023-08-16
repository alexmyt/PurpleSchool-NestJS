import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

import { NotificationType } from './notifications.interface';

export type NotificationModelDocument = HydratedDocument<NotificationModel>;

@Schema()
export class NotificationModel {
  @Prop({ enum: NotificationType, required: true })
  type: NotificationType;
}

export const NotificationModelSchema = SchemaFactory.createForClass(NotificationModel);

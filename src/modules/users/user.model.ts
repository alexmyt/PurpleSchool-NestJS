import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

import { UserRole } from '../../common/permission.enum';

export type UserModelDocument = HydratedDocument<UserModel>;

@Schema({ timestamps: true })
export class UserModel {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  hashedPassword: string;

  @Prop({ enum: UserRole, required: true, default: UserRole.USER })
  role: UserRole;

  @Prop({ required: true })
  phone: string;

  @Prop({ default: false })
  isDeleted: boolean;
}

export const UserModelSchema = SchemaFactory.createForClass(UserModel);

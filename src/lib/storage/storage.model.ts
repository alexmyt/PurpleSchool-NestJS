import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongoSchema } from 'mongoose';

import { StorageType } from './storage.interface';

export type StorageModelDocument = HydratedDocument<StorageModel>;

@Schema()
export class StorageModel {
  @Prop({ enum: StorageType, required: true })
  storageType: StorageType;

  @Prop({ type: MongoSchema.Types.ObjectId, required: true, index: true })
  ownerId: string;

  @Prop()
  url: string;

  @Prop()
  destination: string;

  @Prop()
  filename: string;

  @Prop()
  originalname: string;

  @Prop()
  size: number;

  @Prop()
  mimetype: string;

  @Prop({ default: false })
  isUploaded: boolean;

  @Prop({ default: false })
  isDeleted: boolean;
}

export const StorageModelSchema = SchemaFactory.createForClass(StorageModel);

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongoSchema } from 'mongoose';

import { StorageType } from './storage.interface';

export type StorageModelDocument = HydratedDocument<StorageModel>;

@Schema()
export class StorageModel {
  @Prop({ enum: StorageType, required: true })
  storageType: StorageType;

  @Prop({ type: MongoSchema.Types.ObjectId, required: true, index: true })
  owner: string;

  @Prop()
  url: string;

  @Prop()
  destination: string;

  @Prop({ required: true })
  filename: string;

  @Prop()
  originalname: string;

  @Prop()
  size: number;

  @Prop()
  mimetype: string;
}

export const StorageModelSchema = SchemaFactory.createForClass(StorageModel);

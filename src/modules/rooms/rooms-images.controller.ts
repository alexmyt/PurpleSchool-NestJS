import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFiles,
  ParseFilePipe,
  FileTypeValidator,
  Delete,
  HttpCode,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';

import { MongoIdParam } from '../../common/decorators/mongo-id.decorator';
import { CheckAbility } from '../../lib/casl/policies.decorator';
import { Action } from '../../common/permission.enum';

import { RoomModel } from './room.model';
import { RoomsSubjectHook } from './rooms.subject-hook';
import { RoomsImagesService } from './rooms-images.service';

@Controller('rooms')
export class RoomsImagesController {
  constructor(private readonly roomsImagesService: RoomsImagesService) {}

  @Post(':id/images')
  @CheckAbility(RoomModel, RoomsSubjectHook, Action.UPDATE)
  @UseInterceptors(FilesInterceptor('files'))
  async uploadImage(
    @MongoIdParam('id') id: string,
    @UploadedFiles(
      new ParseFilePipe({ validators: [new FileTypeValidator({ fileType: 'image' })] }),
    )
    files: Express.Multer.File[],
  ) {
    return this.roomsImagesService.uploadImages(id, files);
  }

  @Delete(':id/images/:imageId')
  @HttpCode(204)
  @CheckAbility(RoomModel, RoomsSubjectHook, Action.UPDATE)
  async deleteImage(@MongoIdParam('id') id: string, @MongoIdParam('imageId') imageId: string) {
    return this.roomsImagesService.deleteImage(id, imageId);
  }
}

import {
  Post,
  UseInterceptors,
  UploadedFiles,
  ParseFilePipe,
  FileTypeValidator,
  Delete,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import {
  ApiBody,
  ApiConsumes,
  ApiCreatedResponse,
  ApiOperation,
  ApiParam,
  ApiResponse,
} from '@nestjs/swagger';

import { MongoIdParam } from '../../common/decorators/mongo-id.decorator';
import { CheckAbility } from '../../lib/casl/policies.decorator';
import { Action } from '../../common/permission.enum';
import { GenericController } from '../../common/decorators/controller.decorator';

import { RoomModel } from './room.model';
import { RoomsSubjectHook } from './rooms.subject-hook';
import { RoomsImagesService } from './rooms-images.service';
import { ImageResponseDTO } from './dto/room.response';
import { FilesUploadDto } from './dto/files-upload.dto';

@GenericController('rooms')
export class RoomsImagesController {
  constructor(private readonly roomsImagesService: RoomsImagesService) {}

  @Post(':id/images')
  @CheckAbility(RoomModel, RoomsSubjectHook, Action.UPDATE)
  @UseInterceptors(FilesInterceptor('files'))
  @ApiOperation({ summary: 'Add image for room' })
  @ApiCreatedResponse({ type: ImageResponseDTO })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ description: 'Images for room', type: FilesUploadDto })
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
  @HttpCode(HttpStatus.NO_CONTENT)
  @CheckAbility(RoomModel, RoomsSubjectHook, Action.UPDATE)
  @ApiOperation({ summary: 'Remove room image' })
  @ApiResponse({ status: HttpStatus.NO_CONTENT, type: ImageResponseDTO })
  @ApiParam({ name: 'id', description: 'Room ID' })
  @ApiParam({ name: 'imageId', description: 'Image ID' })
  async deleteImage(@MongoIdParam('id') id: string, @MongoIdParam('imageId') imageId: string) {
    return this.roomsImagesService.deleteImage(id, imageId);
  }
}

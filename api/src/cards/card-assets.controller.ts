import {
  BadRequestException,
  Body,
  Controller,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';

import { AuthGuard } from '../auth/auth.guard';
import { CurrentUser, type AuthUser } from '../auth/current-user.decorator';
import { CardAssetsService } from './card-assets.service';

interface UploadedAssetFile {
  buffer: Buffer;
  mimetype: string;
  originalname: string;
  size: number;
}

interface UploadCardAssetDto {
  assetType?: string;
}

@Controller('cards/assets')
@UseGuards(AuthGuard)
export class CardAssetsController {
  constructor(private readonly cardAssets: CardAssetsService) {}

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  async uploadAsset(
    @CurrentUser() user: AuthUser,
    @Body() body: UploadCardAssetDto,
    @UploadedFile() file?: UploadedAssetFile,
  ) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    if (body.assetType !== 'image' && body.assetType !== 'audio') {
      throw new BadRequestException('assetType must be image or audio');
    }

    return this.cardAssets.uploadAsset({
      assetType: body.assetType,
      fileBuffer: file.buffer,
      mimeType: file.mimetype,
      originalName: file.originalname,
      size: file.size,
      userId: user.id,
    });
  }
}

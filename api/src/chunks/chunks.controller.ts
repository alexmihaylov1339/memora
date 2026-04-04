import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import { ChunksService } from './chunks.service';
import type { ChunkIdParamDto } from './dto/chunk-id-param.dto';
import type { CreateChunkDto } from './dto/create-chunk.dto';
import type { UpdateChunkDto } from './dto/update-chunk.dto';
import {
  validateChunkId,
  validateCreateChunkInput,
  validateUpdateChunkInput,
} from './dto/chunk-validation';

@Controller('chunks')
@UseGuards(AuthGuard)
export class ChunksController {
  constructor(private readonly chunks: ChunksService) {}

  @Post()
  async create(@Body() body: CreateChunkDto) {
    validateCreateChunkInput(body);

    const result = await this.chunks.create({
      deckId: body.deckId.trim(),
      title: body.title.trim(),
      cardIds: body.cardIds?.map((id) => id.trim()),
      position: body.position,
    });

    if (result.status === 'deck_not_found') {
      throw new NotFoundException('deck not found');
    }

    if (result.status === 'invalid_cards') {
      throw new BadRequestException(
        'cardIds must reference existing cards in the same deck',
      );
    }

    return result.chunk;
  }

  @Get(':id')
  async getById(@Param() params: ChunkIdParamDto) {
    const id = validateChunkId(params.id);

    const chunk = await this.chunks.findOne(id);
    if (!chunk) {
      throw new NotFoundException('chunk not found');
    }

    return chunk;
  }

  @Put(':id')
  async update(@Param() params: ChunkIdParamDto, @Body() body: UpdateChunkDto) {
    const id = validateChunkId(params.id);
    validateUpdateChunkInput(body);

    const result = await this.chunks.update(id, {
      title: body.title?.trim(),
      cardIds: body.cardIds?.map((cardId) => cardId.trim()),
      position: body.position,
    });

    if (result.status === 'not_found') {
      throw new NotFoundException('chunk not found');
    }

    if (result.status === 'invalid_cards') {
      throw new BadRequestException(
        'cardIds must reference existing cards in the same deck',
      );
    }

    return result.chunk;
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param() params: ChunkIdParamDto) {
    const id = validateChunkId(params.id);

    const removed = await this.chunks.remove(id);
    if (!removed) {
      throw new NotFoundException('chunk not found');
    }
  }
}

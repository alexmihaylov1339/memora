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
import { CHUNK_ERROR_MESSAGES } from './chunk-errors';
import type { ChunkIdParamDto } from './dto/chunk-id-param.dto';
import type { CreateChunkDto } from './dto/create-chunk.dto';
import type { UpdateChunkDto } from './dto/update-chunk.dto';
import {
  validateChunkId,
  validateCreateChunkInput,
  validateUpdateChunkInput,
} from './dto/chunk-validation';
import {
  serializeChunkResponse,
  serializeChunkResponseList,
} from './dto/chunk-response.dto';

@Controller('chunks')
@UseGuards(AuthGuard)
export class ChunksController {
  constructor(private readonly chunks: ChunksService) {}

  @Get()
  async list() {
    const chunks = await this.chunks.findAll();

    return serializeChunkResponseList(chunks);
  }

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
      throw new NotFoundException(CHUNK_ERROR_MESSAGES.deckNotFound);
    }

    if (result.status === 'invalid_cards') {
      throw new BadRequestException(
        CHUNK_ERROR_MESSAGES.cardIdsMustReferenceDeck,
      );
    }

    return serializeChunkResponse(result.chunk);
  }

  @Get(':id')
  async getById(@Param() params: ChunkIdParamDto) {
    const id = validateChunkId(params.id);

    const chunk = await this.chunks.findOne(id);
    if (!chunk) {
      throw new NotFoundException(CHUNK_ERROR_MESSAGES.chunkNotFound);
    }

    return serializeChunkResponse(chunk);
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
      throw new NotFoundException(CHUNK_ERROR_MESSAGES.chunkNotFound);
    }

    if (result.status === 'invalid_cards') {
      throw new BadRequestException(
        CHUNK_ERROR_MESSAGES.cardIdsMustReferenceDeck,
      );
    }

    return serializeChunkResponse(result.chunk);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param() params: ChunkIdParamDto) {
    const id = validateChunkId(params.id);

    const removed = await this.chunks.remove(id);
    if (!removed) {
      throw new NotFoundException(CHUNK_ERROR_MESSAGES.chunkNotFound);
    }
  }
}

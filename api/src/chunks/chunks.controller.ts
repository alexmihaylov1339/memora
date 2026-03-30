import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import { ChunksService } from './chunks.service';
import type { CreateChunkDto } from './dto/create-chunk.dto';
import type { ChunkIdParamDto } from './dto/chunk-id-param.dto';
import {
  validateChunkId,
  validateCreateChunkInput,
} from './dto/chunk-validation';

@Controller('chunks')
@UseGuards(AuthGuard)
export class ChunksController {
  constructor(private readonly chunks: ChunksService) {}

  @Post()
  @HttpCode(HttpStatus.NOT_IMPLEMENTED)
  create(@Body() body: CreateChunkDto) {
    validateCreateChunkInput(body);
    return this.chunks.createStub(body);
  }

  @Get(':id')
  @HttpCode(HttpStatus.NOT_IMPLEMENTED)
  getById(@Param() params: ChunkIdParamDto) {
    const id = validateChunkId(params.id);
    return this.chunks.getByIdStub(id);
  }
}

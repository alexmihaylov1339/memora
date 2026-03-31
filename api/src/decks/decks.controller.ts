import {
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
import { DecksService } from './decks.service';
import { ChunksService } from '../chunks/chunks.service';
import type { CreateDeckDto } from './dto/create-deck.dto';
import type { DeckIdParamDto } from './dto/deck-id-param.dto';
import type { UpdateDeckDto } from './dto/update-deck.dto';
import {
  validateCreateDeckInput,
  validateDeckId,
  validateUpdateDeckInput,
} from './dto/deck-validation';

/**
 * Deck API contract (Step 1 lock):
 * - GET /v1/decks -> 200, DeckListItem[]
 * - POST /v1/decks -> 201, DeckRecord
 * - GET /v1/decks/:id -> 200, DeckDetail (implemented in Step 1/T2)
 * - PUT /v1/decks/:id -> 200, DeckDetail (implemented in Step 1/T2)
 * - DELETE /v1/decks/:id -> 204, empty body (implemented in Step 1/T2)
 * Error codes: 400, 401, 404
 */
@Controller('decks')
@UseGuards(AuthGuard)
export class DecksController {
  constructor(
    private decks: DecksService,
    private chunks: ChunksService,
  ) {}

  @Get()
  list() {
    return this.decks.findAll();
  }

  @Post()
  create(@Body() body: CreateDeckDto) {
    validateCreateDeckInput(body);

    return this.decks.create(body.name.trim(), body.description?.trim());
  }

  @Get(':id/chunks')
  async listChunks(@Param() params: DeckIdParamDto) {
    const id = validateDeckId(params.id);

    const chunks = await this.chunks.findByDeck(id);
    if (!chunks) {
      throw new NotFoundException('deck not found');
    }

    return chunks;
  }

  @Get(':id')
  async getById(@Param() params: DeckIdParamDto) {
    const id = validateDeckId(params.id);

    const deck = await this.decks.findOne(id);
    if (!deck) {
      throw new NotFoundException('deck not found');
    }

    return deck;
  }

  @Put(':id')
  async update(@Param() params: DeckIdParamDto, @Body() body: UpdateDeckDto) {
    const id = validateDeckId(params.id);
    validateUpdateDeckInput(body);

    const deck = await this.decks.update(id, {
      name: body.name?.trim(),
      description: body.description?.trim(),
    });
    if (!deck) {
      throw new NotFoundException('deck not found');
    }

    return deck;
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param() params: DeckIdParamDto) {
    const id = validateDeckId(params.id);

    const removed = await this.decks.remove(id);
    if (!removed) {
      throw new NotFoundException('deck not found');
    }
  }
}

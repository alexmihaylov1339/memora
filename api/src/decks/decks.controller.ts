import {
  Body,
  BadRequestException,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import { DecksService } from './decks.service';
import { ChunksService } from '../chunks/chunks.service';
import { serializeCardResponseList } from '../cards/dto/card-response.dto';
import { DECK_ERROR_MESSAGES } from './deck-errors';
import { serializeChunkResponseList } from '../chunks/dto/chunk-response.dto';
import type { ListChunksQueryDto } from '../chunks/dto/list-chunks-query.dto';
import type { CreateDeckDto } from './dto/create-deck.dto';
import type { DeckIdParamDto } from './dto/deck-id-param.dto';
import {
  serializeDeckDetail,
  serializeDeckListResponse,
  serializeDeckRecord,
} from './dto/deck-response.dto';
import type { UpdateDeckDto } from './dto/update-deck.dto';
import { validateListChunksQuery } from '../chunks/dto/chunk-validation';
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
    return this.decks.findAll().then(serializeDeckListResponse);
  }

  @Post()
  async create(@Body() body: CreateDeckDto) {
    validateCreateDeckInput(body);

    const result = await this.decks.create(
      body.name.trim(),
      body.description?.trim(),
      normalizeCardIds(body.cardIds),
    );

    if (result.status === 'invalid_cards') {
      throw new BadRequestException(
        DECK_ERROR_MESSAGES.cardIdsMustReferenceExistingCards,
      );
    }

    return serializeDeckRecord(result.deck);
  }

  @Get(':id/chunks')
  async listChunks(
    @Param() params: DeckIdParamDto,
    @Query() query: ListChunksQueryDto,
  ) {
    const id = validateDeckId(params.id);
    const normalizedQuery = validateListChunksQuery({
      limit: query.limit !== undefined ? Number(query.limit) : undefined,
      offset: query.offset !== undefined ? Number(query.offset) : undefined,
      direction: query.direction,
    });

    const chunks = await this.chunks.findByDeckWithOptions(id, normalizedQuery);
    if (!chunks) {
      throw new NotFoundException(DECK_ERROR_MESSAGES.deckNotFound);
    }

    return serializeChunkResponseList(chunks);
  }

  @Get(':id/cards')
  async listCards(@Param() params: DeckIdParamDto) {
    const id = validateDeckId(params.id);

    const cards = await this.decks.findCards(id);
    if (!cards) {
      throw new NotFoundException(DECK_ERROR_MESSAGES.deckNotFound);
    }

    return serializeCardResponseList(cards);
  }

  @Get(':id')
  async getById(@Param() params: DeckIdParamDto) {
    const id = validateDeckId(params.id);

    const deck = await this.decks.findOne(id);
    if (!deck) {
      throw new NotFoundException(DECK_ERROR_MESSAGES.deckNotFound);
    }

    return serializeDeckDetail(deck);
  }

  @Put(':id')
  async update(@Param() params: DeckIdParamDto, @Body() body: UpdateDeckDto) {
    const id = validateDeckId(params.id);
    validateUpdateDeckInput(body);

    const deck = await this.decks.update(id, {
      name: body.name?.trim(),
      description: body.description?.trim(),
      cardIds: normalizeCardIds(body.cardIds),
    });
    if (deck.status === 'not_found') {
      throw new NotFoundException(DECK_ERROR_MESSAGES.deckNotFound);
    }

    if (deck.status === 'invalid_cards') {
      throw new BadRequestException(
        DECK_ERROR_MESSAGES.cardIdsMustReferenceExistingCards,
      );
    }

    return serializeDeckDetail(deck.deck);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param() params: DeckIdParamDto) {
    const id = validateDeckId(params.id);

    const removed = await this.decks.remove(id);
    if (!removed) {
      throw new NotFoundException(DECK_ERROR_MESSAGES.deckNotFound);
    }
  }
}

function normalizeCardIds(cardIds?: string[]) {
  return cardIds?.map((cardId) => cardId.trim()) ?? [];
}

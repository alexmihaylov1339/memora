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
import { CurrentUser, type AuthUser } from '../auth/current-user.decorator';
import { DECK_ERROR_MESSAGES } from './deck-errors';
import type { CreateDeckDto } from './dto/create-deck.dto';
import type { DeckIdParamDto } from './dto/deck-id-param.dto';
import {
  serializeDeckDetail,
  serializeDeckListResponse,
  serializeDeckRecord,
} from './dto/deck-response.dto';
import type { UpdateDeckDto } from './dto/update-deck.dto';
import {
  validateCreateDeckInput,
  validateDeckId,
  validateUpdateDeckInput,
} from './dto/deck-validation';
import { DecksService } from './decks.service';

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
  constructor(private readonly decks: DecksService) {}

  @Get()
  list(@CurrentUser() user: AuthUser) {
    return this.decks.findAll(user.id).then(serializeDeckListResponse);
  }

  @Post()
  async create(@CurrentUser() user: AuthUser, @Body() body: CreateDeckDto) {
    validateCreateDeckInput(body);
    const normalizedCardIds = normalizeDeckIds(body.cardIds);
    const normalizedChunkIds = normalizeDeckIds(body.chunkIds);

    const result = await this.decks.create(
      body.name.trim(),
      body.description?.trim(),
      normalizedCardIds,
      normalizedChunkIds,
      user.id,
    );

    if (result.status === 'invalid_cards') {
      throw new BadRequestException(
        DECK_ERROR_MESSAGES.cardIdsMustReferenceExistingCards,
      );
    }

    if (result.status === 'invalid_chunks') {
      throw new BadRequestException(
        DECK_ERROR_MESSAGES.chunkIdsMustReferenceExistingChunks,
      );
    }

    return serializeDeckRecord(result.deck);
  }

  @Get(':id')
  async getById(
    @CurrentUser() user: AuthUser,
    @Param() params: DeckIdParamDto,
  ) {
    const id = validateDeckId(params.id);
    const deck = await this.decks.findOne(id, user.id);

    if (!deck) {
      throw new NotFoundException(DECK_ERROR_MESSAGES.deckNotFound);
    }

    return serializeDeckDetail(deck);
  }

  @Put(':id')
  async update(
    @CurrentUser() user: AuthUser,
    @Param() params: DeckIdParamDto,
    @Body() body: UpdateDeckDto,
  ) {
    const id = validateDeckId(params.id);
    validateUpdateDeckInput(body);
    const normalizedCardIds = normalizeDeckIds(body.cardIds);
    const normalizedChunkIds = normalizeDeckIds(body.chunkIds);

    const result = await this.decks.update(
      id,
      {
        name: body.name?.trim(),
        description: body.description?.trim(),
        cardIds: normalizedCardIds,
        chunkIds: normalizedChunkIds,
      },
      user.id,
    );

    if (result.status === 'not_found') {
      throw new NotFoundException(DECK_ERROR_MESSAGES.deckNotFound);
    }

    if (result.status === 'invalid_cards') {
      throw new BadRequestException(
        DECK_ERROR_MESSAGES.cardIdsMustReferenceExistingCards,
      );
    }

    if (result.status === 'invalid_chunks') {
      throw new BadRequestException(
        DECK_ERROR_MESSAGES.chunkIdsMustReferenceExistingChunks,
      );
    }

    return serializeDeckDetail(result.deck);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@CurrentUser() user: AuthUser, @Param() params: DeckIdParamDto) {
    const id = validateDeckId(params.id);
    const removed = await this.decks.remove(id, user.id);

    if (!removed) {
      throw new NotFoundException(DECK_ERROR_MESSAGES.deckNotFound);
    }
  }
}

function normalizeDeckIds(ids?: string[]): string[] {
  return ids?.map((id) => id.trim()) ?? [];
}

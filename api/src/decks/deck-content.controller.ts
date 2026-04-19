import {
  Controller,
  Get,
  NotFoundException,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import { CurrentUser, type AuthUser } from '../auth/current-user.decorator';
import { serializeCardResponseList } from '../cards/dto/card-response.dto';
import { validateListCardsQuery } from '../cards/dto/card-validation';
import type { ListCardsQueryDto } from '../cards/dto/list-cards-query.dto';
import { ChunksService } from '../chunks/chunks.service';
import { serializeChunkResponseList } from '../chunks/dto/chunk-response.dto';
import { validateListChunksQuery } from '../chunks/dto/chunk-validation';
import type { ListChunksQueryDto } from '../chunks/dto/list-chunks-query.dto';
import { DECK_ERROR_MESSAGES } from './deck-errors';
import type { DeckIdParamDto } from './dto/deck-id-param.dto';
import { validateDeckId } from './dto/deck-validation';
import { DecksService } from './decks.service';

@Controller('decks')
@UseGuards(AuthGuard)
export class DeckContentController {
  constructor(
    private readonly decks: DecksService,
    private readonly chunks: ChunksService,
  ) {}

  @Get(':id/chunks')
  async listChunks(
    @CurrentUser() user: AuthUser,
    @Param() params: DeckIdParamDto,
    @Query() query: ListChunksQueryDto,
  ) {
    const id = validateDeckId(params.id);
    const normalizedQuery = validateListChunksQuery(
      normalizeListQueryInput(query),
    );

    const chunks = await this.chunks.findByDeckWithOptions(
      id,
      normalizedQuery,
      user.id,
    );
    if (!chunks) {
      throw new NotFoundException(DECK_ERROR_MESSAGES.deckNotFound);
    }

    return serializeChunkResponseList(chunks);
  }

  @Get(':id/cards')
  async listCards(
    @CurrentUser() user: AuthUser,
    @Param() params: DeckIdParamDto,
    @Query() query: ListCardsQueryDto,
  ) {
    const id = validateDeckId(params.id);
    const normalizedQuery = validateListCardsQuery(
      normalizeListQueryInput(query),
    );

    const cards = await this.decks.findCards(id, normalizedQuery, user.id);
    if (!cards) {
      throw new NotFoundException(DECK_ERROR_MESSAGES.deckNotFound);
    }

    return serializeCardResponseList(cards);
  }
}

function toOptionalNumber(value: unknown): number | undefined {
  if (value === undefined) {
    return undefined;
  }

  if (typeof value === 'number') {
    return value;
  }

  if (typeof value === 'string') {
    return Number(value);
  }

  return undefined;
}

function normalizeListQueryInput(query: {
  limit?: unknown;
  offset?: unknown;
  direction?: unknown;
}): {
  limit?: number;
  offset?: number;
  direction?: 'asc' | 'desc';
} {
  return {
    limit: toOptionalNumber(query.limit),
    offset: toOptionalNumber(query.offset),
    direction:
      query.direction === 'desc'
        ? 'desc'
        : query.direction === 'asc'
          ? 'asc'
          : undefined,
  };
}

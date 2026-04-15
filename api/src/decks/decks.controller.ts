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
import { CurrentUser, type AuthUser } from '../auth/current-user.decorator';
import { DecksService } from './decks.service';
import { ChunksService } from '../chunks/chunks.service';
import { serializeCardResponseList } from '../cards/dto/card-response.dto';
import { DECK_ERROR_MESSAGES } from './deck-errors';
import {
  serializeDeckShare,
  serializeDeckShareListResponse,
} from './dto/deck-share.dto';
import type { CreateDeckShareDto } from './dto/create-deck-share.dto';
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
  validateCreateDeckShareInput,
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
  list(@CurrentUser() user: AuthUser) {
    return this.decks.findAll(user.id).then(serializeDeckListResponse);
  }

  @Post()
  async create(@CurrentUser() user: AuthUser, @Body() body: CreateDeckDto) {
    validateCreateDeckInput(body);

    const result = await this.decks.create(
      body.name.trim(),
      body.description?.trim(),
      normalizeIds(body.cardIds),
      normalizeIds(body.chunkIds),
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

  @Get(':id/chunks')
  async listChunks(
    @CurrentUser() user: AuthUser,
    @Param() params: DeckIdParamDto,
    @Query() query: ListChunksQueryDto,
  ) {
    const id = validateDeckId(params.id);
    const normalizedQuery = validateListChunksQuery({
      limit: query.limit !== undefined ? Number(query.limit) : undefined,
      offset: query.offset !== undefined ? Number(query.offset) : undefined,
      direction: query.direction,
    });

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
  ) {
    const id = validateDeckId(params.id);

    const cards = await this.decks.findCards(id, user.id);
    if (!cards) {
      throw new NotFoundException(DECK_ERROR_MESSAGES.deckNotFound);
    }

    return serializeCardResponseList(cards);
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

  @Get(':id/shares')
  async listShares(
    @CurrentUser() user: AuthUser,
    @Param() params: DeckIdParamDto,
  ) {
    const id = validateDeckId(params.id);

    const shares = await this.decks.listShares(id, user.id);
    if (!shares) {
      throw new NotFoundException(DECK_ERROR_MESSAGES.deckNotFound);
    }

    return serializeDeckShareListResponse(shares);
  }

  @Post(':id/shares')
  async shareDeck(
    @CurrentUser() user: AuthUser,
    @Param() params: DeckIdParamDto,
    @Body() body: CreateDeckShareDto,
  ) {
    const id = validateDeckId(params.id);
    const shareInput = validateCreateDeckShareInput(body);

    const result = await this.decks.shareDeck(
      id,
      shareInput.identifier,
      shareInput.permission ?? 'view',
      user.id,
    );

    if (result.status === 'not_found') {
      throw new NotFoundException(DECK_ERROR_MESSAGES.deckNotFound);
    }

    if (result.status === 'share_target_not_found') {
      throw new NotFoundException(DECK_ERROR_MESSAGES.shareTargetNotFound);
    }

    if (result.status === 'share_target_ambiguous') {
      throw new BadRequestException(DECK_ERROR_MESSAGES.shareTargetAmbiguous);
    }

    if (result.status === 'cannot_share_with_self') {
      throw new BadRequestException(DECK_ERROR_MESSAGES.cannotShareWithSelf);
    }

    if (result.status === 'already_shared') {
      throw new BadRequestException(DECK_ERROR_MESSAGES.deckAlreadyShared);
    }

    return serializeDeckShare(result.share);
  }

  @Delete(':id/shares/:sharedUserId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async removeShare(
    @CurrentUser() user: AuthUser,
    @Param() params: DeckIdParamDto & { sharedUserId: string },
  ) {
    const id = validateDeckId(params.id);
    const sharedUserId = validateDeckId(params.sharedUserId);

    const removed = await this.decks.removeShare(id, sharedUserId, user.id);
    if (!removed) {
      throw new NotFoundException(DECK_ERROR_MESSAGES.sharedUserNotFound);
    }
  }

  @Put(':id')
  async update(
    @CurrentUser() user: AuthUser,
    @Param() params: DeckIdParamDto,
    @Body() body: UpdateDeckDto,
  ) {
    const id = validateDeckId(params.id);
    validateUpdateDeckInput(body);

    const deck = await this.decks.update(
      id,
      {
        name: body.name?.trim(),
        description: body.description?.trim(),
        cardIds: normalizeIds(body.cardIds),
        chunkIds: normalizeIds(body.chunkIds),
      },
      user.id,
    );
    if (deck.status === 'not_found') {
      throw new NotFoundException(DECK_ERROR_MESSAGES.deckNotFound);
    }

    if (deck.status === 'invalid_cards') {
      throw new BadRequestException(
        DECK_ERROR_MESSAGES.cardIdsMustReferenceExistingCards,
      );
    }

    if (deck.status === 'invalid_chunks') {
      throw new BadRequestException(
        DECK_ERROR_MESSAGES.chunkIdsMustReferenceExistingChunks,
      );
    }

    return serializeDeckDetail(deck.deck);
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

function normalizeIds(ids?: string[]) {
  return ids?.map((id) => id.trim()) ?? [];
}

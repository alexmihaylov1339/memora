import {
  BadRequestException,
  Body,
  Controller,
  NotFoundException,
  Param,
  Post,
  Get,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import { CurrentUser, type AuthUser } from '../auth/current-user.decorator';
import {
  serializeCardResponseList,
  type CardResponseDto,
} from '../cards/dto/card-response.dto';
import {
  serializeChunkResponseList,
  type ChunkResponseDto,
} from '../chunks/dto/chunk-response.dto';
import { DECK_ERROR_MESSAGES } from './deck-errors';
import type { DeckIdParamDto } from './dto/deck-id-param.dto';
import type {
  MoveDeckCardsDto,
  MoveDeckChunksDto,
} from './dto/deck-membership.dto';
import {
  serializeDeckCardMembershipMutation,
  serializeDeckChunkMembershipMutation,
} from './dto/deck-membership.dto';
import {
  validateDeckId,
  validateDeckMoveCardsInput,
  validateDeckMoveChunksInput,
} from './dto/deck-validation';
import { DecksService } from './decks.service';

@Controller('decks')
@UseGuards(AuthGuard)
export class DeckMembershipController {
  constructor(private readonly decks: DecksService) {}

  @Get(':id/move-candidates/cards')
  async listMovableCards(
    @CurrentUser() user: AuthUser,
    @Param() params: DeckIdParamDto,
  ): Promise<CardResponseDto[]> {
    const id = validateDeckId(params.id);
    const cards = await this.decks.listMovableCards(id, user.id);
    if (!cards) {
      throw new NotFoundException(DECK_ERROR_MESSAGES.deckNotFound);
    }

    return serializeCardResponseList(cards);
  }

  @Get(':id/move-candidates/chunks')
  async listMovableChunks(
    @CurrentUser() user: AuthUser,
    @Param() params: DeckIdParamDto,
  ): Promise<ChunkResponseDto[]> {
    const id = validateDeckId(params.id);
    const chunks = await this.decks.listMovableChunks(id, user.id);
    if (!chunks) {
      throw new NotFoundException(DECK_ERROR_MESSAGES.deckNotFound);
    }

    return serializeChunkResponseList(chunks);
  }

  @Post(':id/move/cards')
  async moveCards(
    @CurrentUser() user: AuthUser,
    @Param() params: DeckIdParamDto,
    @Body() body: MoveDeckCardsDto,
  ) {
    const id = validateDeckId(params.id);
    const moveInput = validateDeckMoveCardsInput(body);
    const result = await this.decks.moveCards(id, moveInput.cardIds, user.id);

    if (result.status === 'not_found') {
      throw new NotFoundException(DECK_ERROR_MESSAGES.deckNotFound);
    }

    if (result.status === 'invalid_cards') {
      throw new BadRequestException(
        DECK_ERROR_MESSAGES.cardIdsMustReferenceExistingCards,
      );
    }

    return serializeDeckCardMembershipMutation(result.result);
  }

  @Post(':id/move/chunks')
  async moveChunks(
    @CurrentUser() user: AuthUser,
    @Param() params: DeckIdParamDto,
    @Body() body: MoveDeckChunksDto,
  ) {
    const id = validateDeckId(params.id);
    const moveInput = validateDeckMoveChunksInput(body);
    const result = await this.decks.moveChunks(id, moveInput.chunkIds, user.id);

    if (result.status === 'not_found') {
      throw new NotFoundException(DECK_ERROR_MESSAGES.deckNotFound);
    }

    if (result.status === 'invalid_chunks') {
      throw new BadRequestException(
        DECK_ERROR_MESSAGES.chunkIdsMustReferenceExistingChunks,
      );
    }

    return serializeDeckChunkMembershipMutation(result.result);
  }

  @Post(':id/detach/cards')
  async detachCards(
    @CurrentUser() user: AuthUser,
    @Param() params: DeckIdParamDto,
    @Body() body: MoveDeckCardsDto,
  ) {
    const id = validateDeckId(params.id);
    const detachInput = validateDeckMoveCardsInput(body);
    const result = await this.decks.detachCards(
      id,
      detachInput.cardIds,
      user.id,
    );

    if (result.status === 'not_found') {
      throw new NotFoundException(DECK_ERROR_MESSAGES.deckNotFound);
    }

    if (result.status === 'invalid_cards') {
      throw new BadRequestException(
        DECK_ERROR_MESSAGES.cardIdsMustReferenceDeckCards,
      );
    }

    return serializeDeckCardMembershipMutation(result.result);
  }

  @Post(':id/detach/chunks')
  async detachChunks(
    @CurrentUser() user: AuthUser,
    @Param() params: DeckIdParamDto,
    @Body() body: MoveDeckChunksDto,
  ) {
    const id = validateDeckId(params.id);
    const detachInput = validateDeckMoveChunksInput(body);
    const result = await this.decks.detachChunks(
      id,
      detachInput.chunkIds,
      user.id,
    );

    if (result.status === 'not_found') {
      throw new NotFoundException(DECK_ERROR_MESSAGES.deckNotFound);
    }

    if (result.status === 'invalid_chunks') {
      throw new BadRequestException(
        DECK_ERROR_MESSAGES.chunkIdsMustReferenceDeckChunks,
      );
    }

    return serializeDeckChunkMembershipMutation(result.result);
  }
}

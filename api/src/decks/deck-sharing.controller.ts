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
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import { CurrentUser, type AuthUser } from '../auth/current-user.decorator';
import { DECK_ERROR_MESSAGES } from './deck-errors';
import type { CreateDeckShareDto } from './dto/create-deck-share.dto';
import {
  serializeDeckShare,
  serializeDeckShareListResponse,
} from './dto/deck-share.dto';
import type { DeckIdParamDto } from './dto/deck-id-param.dto';
import {
  validateCreateDeckShareInput,
  validateDeckId,
} from './dto/deck-validation';
import { DecksService } from './decks.service';

@Controller('decks')
@UseGuards(AuthGuard)
export class DeckSharingController {
  constructor(private readonly decks: DecksService) {}

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
}

import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import { CurrentUser, type AuthUser } from '../auth/current-user.decorator';
import { DECK_ERROR_MESSAGES } from './deck-errors';
import {
  serializeDeckDetail,
  serializeDeckRecord,
  serializePublicDeckListResponse,
} from './dto/deck-response.dto';
import type { DeckIdParamDto } from './dto/deck-id-param.dto';
import type { UpdateDeckPublicationDto } from './dto/update-deck-publication.dto';
import {
  validateDeckId,
  validateUpdateDeckPublicationInput,
} from './dto/deck-validation';
import { DecksService } from './decks.service';

@Controller('decks')
@UseGuards(AuthGuard)
export class DeckPublicController {
  constructor(private readonly decks: DecksService) {}

  @Get('public')
  async listPublicDecks() {
    const decks = await this.decks.listPublic();
    return serializePublicDeckListResponse(decks);
  }

  @Put(':id/publication')
  async updatePublication(
    @CurrentUser() user: AuthUser,
    @Param() params: DeckIdParamDto,
    @Body() body: UpdateDeckPublicationDto,
  ) {
    const deckId = validateDeckId(params.id);
    const publication = validateUpdateDeckPublicationInput(body);
    const result = await this.decks.updatePublication(
      deckId,
      publication.isPublic,
      user.id,
    );

    if (result.status === 'not_found') {
      throw new NotFoundException(DECK_ERROR_MESSAGES.deckNotFound);
    }

    return serializeDeckDetail(result.deck);
  }

  @Post('public/:id/copy')
  async copyPublicDeck(
    @CurrentUser() user: AuthUser,
    @Param() params: DeckIdParamDto,
  ) {
    const deckId = validateDeckId(params.id);
    const result = await this.decks.copyPublicDeck(deckId, user.id);

    if (result.status === 'not_found') {
      throw new NotFoundException(DECK_ERROR_MESSAGES.publicDeckNotFound);
    }

    return serializeDeckRecord(result.deck);
  }
}

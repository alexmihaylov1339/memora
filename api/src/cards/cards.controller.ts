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
import type { Prisma } from '@prisma/client';

import { AuthGuard } from '../auth/auth.guard';
import { CurrentUser, type AuthUser } from '../auth/current-user.decorator';
import { CARD_ERROR_MESSAGES } from './card-errors';
import { CardsService } from './cards.service';
import type { CardIdParamDto } from './dto/card-id-param.dto';
import {
  serializeCardResponse,
  serializeCardResponseList,
} from './dto/card-response.dto';
import type { CreateCardDto } from './dto/create-card.dto';
import type { UpdateCardDto } from './dto/update-card.dto';
import {
  validateCardId,
  validateCreateCardInput,
  validateUpdateCardInput,
} from './dto/card-validation';

@Controller('cards')
@UseGuards(AuthGuard)
export class CardsController {
  constructor(private readonly cards: CardsService) {}

  @Get()
  async list(@CurrentUser() user: AuthUser) {
    const cards = await this.cards.findAll(user.id);

    return serializeCardResponseList(cards);
  }

  @Post()
  async create(@CurrentUser() user: AuthUser, @Body() body: CreateCardDto) {
    validateCreateCardInput(body);

    const card = await this.cards.create(
      {
        deckIds:
          body.deckIds?.map((deckId) => deckId.trim()) ??
          (body.deckId?.trim() ? [body.deckId.trim()] : undefined),
        kind: body.kind.trim(),
        fields: body.fields as Prisma.JsonObject,
      },
      user.id,
    );

    if (!card) {
      throw new NotFoundException(CARD_ERROR_MESSAGES.deckNotFound);
    }

    return serializeCardResponse(card);
  }

  @Get(':id')
  async getById(
    @CurrentUser() user: AuthUser,
    @Param() params: CardIdParamDto,
  ) {
    const id = validateCardId(params.id);

    const card = await this.cards.findOne(id, user.id);
    if (!card) {
      throw new NotFoundException(CARD_ERROR_MESSAGES.cardNotFound);
    }

    return serializeCardResponse(card);
  }

  @Put(':id')
  async update(
    @CurrentUser() user: AuthUser,
    @Param() params: CardIdParamDto,
    @Body() body: UpdateCardDto,
  ) {
    const id = validateCardId(params.id);
    validateUpdateCardInput(body);

    const card = await this.cards.update(
      id,
      {
        kind: body.kind?.trim(),
        deckIds: body.deckIds?.map((deckId) => deckId.trim()),
        fields: body.fields as Prisma.JsonObject | undefined,
      },
      user.id,
    );
    if (!card) {
      throw new NotFoundException(CARD_ERROR_MESSAGES.cardNotFound);
    }

    return serializeCardResponse(card);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@CurrentUser() user: AuthUser, @Param() params: CardIdParamDto) {
    const id = validateCardId(params.id);

    const removed = await this.cards.remove(id, user.id);
    if (!removed) {
      throw new NotFoundException(CARD_ERROR_MESSAGES.cardNotFound);
    }
  }
}

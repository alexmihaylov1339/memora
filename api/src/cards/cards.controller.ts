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
import { CardsService } from './cards.service';
import type { CreateCardDto } from './dto/create-card.dto';
import type { CardIdParamDto } from './dto/card-id-param.dto';
import type { UpdateCardDto } from './dto/update-card.dto';
import {
  validateCardId,
  validateCreateCardInput,
  validateUpdateCardInput,
} from './dto/card-validation';
import type { Prisma } from '@prisma/client';
import { serializeCardResponse } from './dto/card-response.dto';

@Controller('cards')
@UseGuards(AuthGuard)
export class CardsController {
  constructor(private readonly cards: CardsService) {}

  @Post()
  async create(@Body() body: CreateCardDto) {
    validateCreateCardInput(body);

    const card = await this.cards.create({
      deckId: body.deckId.trim(),
      kind: body.kind.trim(),
      fields: body.fields as Prisma.JsonObject,
    });

    if (!card) {
      throw new NotFoundException('deck not found');
    }

    return serializeCardResponse(card);
  }

  @Get(':id')
  async getById(@Param() params: CardIdParamDto) {
    const id = validateCardId(params.id);

    const card = await this.cards.findOne(id);
    if (!card) {
      throw new NotFoundException('card not found');
    }

    return serializeCardResponse(card);
  }

  @Put(':id')
  async update(@Param() params: CardIdParamDto, @Body() body: UpdateCardDto) {
    const id = validateCardId(params.id);
    validateUpdateCardInput(body);

    const card = await this.cards.update(id, {
      kind: body.kind?.trim(),
      fields: body.fields as Prisma.JsonObject | undefined,
    });
    if (!card) {
      throw new NotFoundException('card not found');
    }

    return serializeCardResponse(card);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param() params: CardIdParamDto) {
    const id = validateCardId(params.id);

    const removed = await this.cards.remove(id);
    if (!removed) {
      throw new NotFoundException('card not found');
    }
  }
}

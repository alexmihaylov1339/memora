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
  constructor(private decks: DecksService) {}

  @Get()
  list() {
    return this.decks.findAll();
  }

  @Post()
  create(@Body() body: { name: string; description?: string }) {
    if (!body?.name) {
      throw new BadRequestException('name is required');
    }
    return this.decks.create(body.name, body.description);
  }

  @Get(':id')
  async getById(@Param('id') id: string) {
    if (!id?.trim()) {
      throw new BadRequestException('id is required');
    }

    const deck = await this.decks.findOne(id);
    if (!deck) {
      throw new NotFoundException('deck not found');
    }

    return deck;
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() body: { name?: string; description?: string },
  ) {
    if (!id?.trim()) {
      throw new BadRequestException('id is required');
    }

    if (!body || (body.name === undefined && body.description === undefined)) {
      throw new BadRequestException('at least one field is required');
    }

    if (body.name !== undefined && !body.name.trim()) {
      throw new BadRequestException('name cannot be empty');
    }

    const deck = await this.decks.update(id, body);
    if (!deck) {
      throw new NotFoundException('deck not found');
    }

    return deck;
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string) {
    if (!id?.trim()) {
      throw new BadRequestException('id is required');
    }

    const removed = await this.decks.remove(id);
    if (!removed) {
      throw new NotFoundException('deck not found');
    }
  }
}

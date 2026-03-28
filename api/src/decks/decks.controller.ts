import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
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
      return { error: 'name is required' };
    }
    return this.decks.create(body.name, body.description);
  }
}

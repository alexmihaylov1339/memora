import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import { DecksService } from './decks.service';

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

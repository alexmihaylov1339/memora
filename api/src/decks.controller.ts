import { Controller, Get } from '@nestjs/common';

@Controller('v1/decks')
export class DecksController {
  @Get()
  findAll() {
    // Temporary in-memory mock data for testing
    return [
      { id: 'd1', name: 'German A1 Nouns', count: 42 },
      { id: 'd2', name: 'Phrasal Verbs', count: 18 },
    ];
  }
}

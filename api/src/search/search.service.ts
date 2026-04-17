import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { searchCards, searchChunks, searchDecks } from './search-queries';
import type { SearchInput, SearchResultItem } from './search.types';

@Injectable()
export class SearchService {
  constructor(private readonly prisma: PrismaService) {}

  async search(
    input: SearchInput,
    userId: string,
  ): Promise<SearchResultItem[]> {
    if (input.type === 'deck') {
      return searchDecks(this.prisma, input.q, input.limit, userId);
    }

    if (input.type === 'card') {
      return searchCards(this.prisma, input.q, input.limit, userId);
    }

    return searchChunks(this.prisma, input.q, input.limit, userId);
  }
}

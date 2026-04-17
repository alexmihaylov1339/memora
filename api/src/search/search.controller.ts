import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import { CurrentUser, type AuthUser } from '../auth/current-user.decorator';
import { SearchService } from './search.service';

type SearchQueryType = 'deck' | 'card' | 'chunk';

interface SearchQueryDto {
  q?: string;
  type?: SearchQueryType;
  limit?: string | number;
}

const DEFAULT_SEARCH_LIMIT = 8;
const MAX_SEARCH_LIMIT = 20;

@Controller('search')
@UseGuards(AuthGuard)
export class SearchController {
  constructor(private readonly search: SearchService) {}

  @Get()
  async list(@CurrentUser() user: AuthUser, @Query() query: SearchQueryDto) {
    const q = query.q?.trim() ?? '';
    const type = query.type ?? 'deck';
    const rawLimit =
      typeof query.limit === 'number'
        ? query.limit
        : Number(query.limit ?? DEFAULT_SEARCH_LIMIT);
    const limit = Number.isFinite(rawLimit)
      ? Math.min(Math.max(rawLimit, 1), MAX_SEARCH_LIMIT)
      : DEFAULT_SEARCH_LIMIT;

    if (!q) {
      return [];
    }

    return this.search.search(
      {
        q,
        type,
        limit,
      },
      user.id,
    );
  }
}

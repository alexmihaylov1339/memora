import { ForbiddenException, Injectable } from '@nestjs/common';

import { PrismaService } from '../../prisma/prisma.service';
import { initStandaloneCardReviewState } from '../reviews/standalone-card-review';
import { BASIC_CARD_KIND } from './card-kind-types';
import type { ParsedRow } from './csv/csv-parser';

@Injectable()
export class CardsImportService {
  constructor(private readonly prisma: PrismaService) {}

  async bulkImportFromCsv(
    userId: string,
    rows: ParsedRow[],
    deckId?: string,
  ): Promise<{ created: number }> {
    if (deckId) {
      const deck = await this.prisma.deck.findFirst({
        where: { id: deckId, ownerId: userId },
      });
      if (!deck) {
        throw new ForbiddenException('deck not found or not accessible');
      }
    }

    if (rows.length === 0) {
      return { created: 0 };
    }

    const now = new Date();

    const created = await this.prisma.card.createManyAndReturn({
      data: rows.map((row) => ({
        ownerId: userId,
        deckId: deckId ?? null,
        kind: BASIC_CARD_KIND,
        fields: { front: row.front, back: row.back },
      })),
      select: { id: true },
    });

    if (deckId) {
      await initStandaloneCardReviewState(
        this.prisma,
        created.map((c) => c.id),
        now,
      );
    }

    return { created: rows.length };
  }
}

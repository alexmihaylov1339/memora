import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

export type SearchEntityType = 'deck' | 'card' | 'chunk';

export interface SearchResultItem {
  id: string;
  type: SearchEntityType;
  label: string;
  description?: string;
}

interface SearchInput {
  q: string;
  type: SearchEntityType;
  limit: number;
}

interface SearchCardRow {
  id: string;
  kind: string;
  deckName: string;
  frontText: string | null;
  backText: string | null;
}

@Injectable()
export class SearchService {
  constructor(private readonly prisma: PrismaService) {}

  async search(input: SearchInput): Promise<SearchResultItem[]> {
    if (input.type === 'deck') {
      return this.searchDecks(input.q, input.limit);
    }

    if (input.type === 'card') {
      return this.searchCards(input.q, input.limit);
    }

    return this.searchChunks(input.q, input.limit);
  }

  private async searchDecks(
    q: string,
    limit: number,
  ): Promise<SearchResultItem[]> {
    const decks = await this.prisma.deck.findMany({
      where: {
        name: {
          contains: q,
          mode: 'insensitive',
        },
      },
      orderBy: [{ updatedAt: 'desc' }, { createdAt: 'desc' }],
      take: limit,
      include: {
        _count: {
          select: { cards: true },
        },
      },
    });

    return decks.map((deck) => ({
      id: deck.id,
      type: 'deck',
      label: deck.name,
      description: `${deck._count.cards} card${deck._count.cards === 1 ? '' : 's'}`,
    }));
  }

  private async searchChunks(
    q: string,
    limit: number,
  ): Promise<SearchResultItem[]> {
    const chunks = await this.prisma.chunk.findMany({
      where: {
        title: {
          contains: q,
          mode: 'insensitive',
        },
      },
      orderBy: [{ updatedAt: 'desc' }, { createdAt: 'desc' }],
      take: limit,
      include: {
        deck: {
          select: { name: true },
        },
        _count: {
          select: { chunkCards: true },
        },
      },
    });

    return chunks.map((chunk) => ({
      id: chunk.id,
      type: 'chunk',
      label: chunk.title,
      description: `${chunk.deck.name} • ${chunk._count.chunkCards} card${chunk._count.chunkCards === 1 ? '' : 's'}`,
    }));
  }

  private async searchCards(
    q: string,
    limit: number,
  ): Promise<SearchResultItem[]> {
    const searchPattern = `%${q}%`;
    const rows = await this.prisma.$queryRaw<SearchCardRow[]>(
      Prisma.sql`
        SELECT
          c.id,
          c.kind,
          d.name AS "deckName",
          COALESCE(c.fields->>'front', NULL) AS "frontText",
          COALESCE(c.fields->>'back', NULL) AS "backText"
        FROM "Card" c
        INNER JOIN "Deck" d ON d.id = c."deckId"
        WHERE
          c.kind ILIKE ${searchPattern}
          OR d.name ILIKE ${searchPattern}
          OR COALESCE(c.fields->>'front', '') ILIKE ${searchPattern}
          OR COALESCE(c.fields->>'back', '') ILIKE ${searchPattern}
        ORDER BY c."createdAt" DESC
        LIMIT ${limit}
      `,
    );

    return rows.map((row) => ({
      id: row.id,
      type: 'card',
      label: row.frontText?.trim() || 'Untitled card',
      description: [row.deckName, row.backText?.trim() || row.kind]
        .filter(Boolean)
        .join(' • '),
    }));
  }
}

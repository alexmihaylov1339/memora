import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { getAccessibleDeckIds } from '../decks/deck-access';
import type { SearchResultItem } from './search.types';

interface SearchCardRow {
  id: string;
  kind: string;
  deckName: string;
  frontText: string | null;
  backText: string | null;
}

async function getAccessibleDeckIdsOrEmpty(
  prisma: PrismaService,
  userId: string,
): Promise<string[]> {
  return getAccessibleDeckIds(prisma, userId);
}

export async function searchDecks(
  prisma: PrismaService,
  q: string,
  limit: number,
  userId: string,
): Promise<SearchResultItem[]> {
  const deckIds = await getAccessibleDeckIdsOrEmpty(prisma, userId);

  if (deckIds.length === 0) {
    return [];
  }

  const decks = await prisma.deck.findMany({
    where: {
      id: { in: deckIds },
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

export async function searchChunks(
  prisma: PrismaService,
  q: string,
  limit: number,
  userId: string,
): Promise<SearchResultItem[]> {
  const deckIds = await getAccessibleDeckIdsOrEmpty(prisma, userId);

  if (deckIds.length === 0) {
    return [];
  }

  const chunks = await prisma.chunk.findMany({
    where: {
      deckId: { in: deckIds },
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

export async function searchCards(
  prisma: PrismaService,
  q: string,
  limit: number,
  userId: string,
): Promise<SearchResultItem[]> {
  const deckIds = await getAccessibleDeckIdsOrEmpty(prisma, userId);

  if (deckIds.length === 0) {
    return [];
  }

  const searchPattern = `%${q}%`;
  const rows = await prisma.$queryRaw<SearchCardRow[]>(
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
        c."deckId" IN (${Prisma.join(deckIds)})
        AND (
        c.kind ILIKE ${searchPattern}
        OR d.name ILIKE ${searchPattern}
        OR COALESCE(c.fields->>'front', '') ILIKE ${searchPattern}
        OR COALESCE(c.fields->>'back', '') ILIKE ${searchPattern}
        )
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

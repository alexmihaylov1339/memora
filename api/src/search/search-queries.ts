import { PrismaService } from '../../prisma/prisma.service';
import { getAccessibleDeckIds } from '../decks/deck-access';
import type { SearchResultItem } from './search.types';

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

  const chunks = await prisma.chunk.findMany({
    where: {
      title: {
        contains: q,
        mode: 'insensitive',
      },
      OR: [
        { ownerId: userId },
        ...(deckIds.length > 0 ? [{ deckId: { in: deckIds } }] : []),
      ],
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
    description: `${chunk.deck?.name ?? 'Unassigned'} • ${chunk._count.chunkCards} card${chunk._count.chunkCards === 1 ? '' : 's'}`,
  }));
}

export async function searchCards(
  prisma: PrismaService,
  q: string,
  limit: number,
  userId: string,
): Promise<SearchResultItem[]> {
  const deckIds = await getAccessibleDeckIdsOrEmpty(prisma, userId);
  const cards = await prisma.card.findMany({
    where: {
      OR: [
        { ownerId: userId },
        ...(deckIds.length > 0 ? [{ deckId: { in: deckIds } }] : []),
      ],
    },
    orderBy: [{ createdAt: 'desc' }],
    include: { deck: { select: { name: true } } },
  });

  const normalizedQuery = q.trim().toLowerCase();

  return cards
    .map((card) => {
      const fields = card.fields as Record<string, unknown>;
      const frontText =
        typeof fields.front === 'string' ? fields.front.trim() : '';
      const backText =
        typeof fields.back === 'string' ? fields.back.trim() : '';
      const deckName = card.deck?.name ?? '';
      const searchable = [
        card.kind,
        deckName,
        frontText,
        backText,
      ]
        .join(' ')
        .toLowerCase();

      return { card, frontText, backText, searchable };
    })
    .filter((entry) => entry.searchable.includes(normalizedQuery))
    .slice(0, limit)
    .map(({ card, frontText, backText }) => {
      return {
        id: card.id,
        type: 'card',
        label: frontText || 'Untitled card',
        description: [card.deck?.name ?? 'Unassigned', backText || card.kind]
          .filter(Boolean)
          .join(' • '),
      };
    });
}

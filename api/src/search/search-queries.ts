import { PrismaService } from '../../prisma/prisma.service';
import { getAccessibleDeckIds } from '../decks/deck-access';
import { getDeckCardCounts } from '../decks/decks.helpers';
import { getCardSearchPreview } from './card-search-preview';
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
  });
  const cardCounts = await getDeckCardCounts(
    prisma,
    decks.map((deck) => deck.id),
  );

  return decks.map((deck) => ({
    id: deck.id,
    type: 'deck',
    label: deck.name,
    description: `${cardCounts.get(deck.id) ?? 0} card${cardCounts.get(deck.id) === 1 ? '' : 's'}`,
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
        ...(deckIds.length > 0
          ? [{ deckCards: { some: { deckId: { in: deckIds } } } }]
          : []),
      ],
    },
    orderBy: [{ createdAt: 'desc' }],
    include: {
      deckCards: {
        orderBy: { createdAt: 'asc' },
        select: { deck: { select: { name: true } } },
      },
    },
  });

  const normalizedQuery = q.trim().toLowerCase();

  return cards
    .map((card) => {
      const preview = getCardSearchPreview(card);
      const deckNames = card.deckCards.map((membership) => membership.deck.name);
      const searchable = [...deckNames, preview.searchableText]
        .join(' ')
        .toLowerCase();

      return { card, preview, searchable };
    })
    .filter((entry) => entry.searchable.includes(normalizedQuery))
    .slice(0, limit)
    .map(({ card, preview }) => {
      return {
        id: card.id,
        type: 'card',
        label: preview.label,
        description: [
          card.deckCards.length > 0
            ? card.deckCards.map((membership) => membership.deck.name).join(', ')
            : 'Unassigned',
          preview.description ?? card.kind,
        ]
          .filter(Boolean)
          .join(' • '),
      };
    });
}

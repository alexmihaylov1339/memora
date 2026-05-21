import { PrismaService } from '../../prisma/prisma.service';
import { getAccessibleDeckIds } from './deck-access';
import type { DeckPresentationMode } from './deck-presentation-mode';
import { getDueCardCountsByDeck } from './deck-review-counts';
import {
  getDeckCardCounts,
  mapDeckDetail,
  mapDeckShareSummary,
  type DeckShareWithUser,
  type DeckWithShares,
} from './decks.helpers';
import type { DeckDetail, DeckListItem, DeckShareSummary } from './decks.types';

export async function listDecks(
  prisma: PrismaService,
  userId: string,
): Promise<DeckListItem[]> {
  const deckIds = await getAccessibleDeckIds(prisma, userId);
  if (deckIds.length === 0) {
    return [];
  }

  const decks = await prisma.deck.findMany({
    where: { id: { in: deckIds } },
  });
  const cardCounts = await getDeckCardCounts(prisma, deckIds);
  const dueCounts = await getDueCardCountsByDeck(prisma, deckIds);

  return decks.map((deck) => ({
    id: deck.id,
    name: deck.name,
    count: cardCounts.get(deck.id) ?? 0,
    dueCount: dueCounts.get(deck.id) ?? 0,
    presentationMode: deck.presentationMode as DeckPresentationMode,
  }));
}

export async function getDeckDetail(
  prisma: PrismaService,
  id: string,
  userId: string,
): Promise<DeckDetail | null> {
  const deckIds = await getAccessibleDeckIds(prisma, userId);
  if (!deckIds.includes(id)) {
    return null;
  }

  const deck = (await prisma.deck.findFirst({
    where: { id },
    include: {
      shares: {
        orderBy: [{ createdAt: 'asc' }, { id: 'asc' }],
        include: {
          user: {
            select: {
              id: true,
              email: true,
              name: true,
              createdAt: true,
              updatedAt: true,
            },
          },
        },
      },
    },
  })) as DeckWithShares | null;

  if (!deck) {
    return null;
  }

  const count = await prisma.deckCard.count({ where: { deckId: id } });

  return mapDeckDetail(deck, count);
}

export async function listDeckShares(
  prisma: PrismaService,
  deckId: string,
  userId: string,
): Promise<DeckShareSummary[] | null> {
  const deck = await prisma.deck.findFirst({
    where: { id: deckId, ownerId: userId },
    select: { id: true },
  });
  if (!deck) {
    return null;
  }

  const shares = (await prisma.deckShare.findMany({
    where: { deckId },
    orderBy: [{ createdAt: 'asc' }, { id: 'asc' }],
    include: {
      user: {
        select: {
          id: true,
          email: true,
          name: true,
          createdAt: true,
          updatedAt: true,
        },
      },
    },
  })) as DeckShareWithUser[];

  return shares.map((share) => mapDeckShareSummary(share));
}

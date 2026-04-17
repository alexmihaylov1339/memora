import type { CardRecord } from '../cards/cards.service';
import { PrismaService } from '../../prisma/prisma.service';
import { getAccessibleDeckIds } from './deck-access';
import {
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
    include: { _count: { select: { cards: true } } },
  });

  return decks.map((deck) => ({
    id: deck.id,
    name: deck.name,
    count: deck._count.cards,
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
      _count: { select: { cards: true } },
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

  return deck ? mapDeckDetail(deck) : null;
}

export async function listDeckCards(
  prisma: PrismaService,
  id: string,
  userId: string,
): Promise<CardRecord[] | null> {
  const deckIds = await getAccessibleDeckIds(prisma, userId);
  if (!deckIds.includes(id)) {
    return null;
  }

  return (await prisma.card.findMany({
    where: { deckId: id },
    orderBy: [{ createdAt: 'asc' }, { id: 'asc' }],
  })) as CardRecord[];
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

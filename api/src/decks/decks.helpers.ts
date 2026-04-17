import type { Prisma } from '@prisma/client';
import type { PrismaService } from '../../prisma/prisma.service';
import type { DeckSharePermission } from './deck-share.types';

export interface DeckListItem {
  id: string;
  name: string;
  count: number;
}

export interface DeckRecord {
  id: string;
  name: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface DeckShareSummary {
  id: string;
  deckId: string;
  userId: string;
  email: string;
  name?: string;
  permission: DeckSharePermission;
  createdAt: Date;
  updatedAt: Date;
}

export interface DeckDetail extends DeckRecord {
  count: number;
  sharedUsers: DeckShareSummary[];
}

export type DeckShareWithUser = Prisma.DeckShareGetPayload<{
  include: {
    user: {
      select: {
        id: true;
        email: true;
        name: true;
        createdAt: true;
        updatedAt: true;
      };
    };
  };
}>;

export type DeckWithShares = Prisma.DeckGetPayload<{
  include: {
    _count: {
      select: { cards: true };
    };
    shares: {
      orderBy: [{ createdAt: 'asc' }, { id: 'asc' }];
      include: {
        user: {
          select: {
            id: true;
            email: true;
            name: true;
            createdAt: true;
            updatedAt: true;
          };
        };
      };
    };
  };
}>;

type DeckPersistenceClient = Pick<
  PrismaService,
  'card' | 'chunk' | 'chunkCard' | 'deck' | 'deckShare' | 'user'
>;

export async function findOwnedDeck(
  prisma: PrismaService,
  id: string,
  userId: string,
) {
  return prisma.deck.findFirst({
    where: { id, ownerId: userId },
    select: { id: true },
  });
}

export function mapDeckShareSummary(
  share: DeckShareWithUser,
): DeckShareSummary {
  return {
    id: share.id,
    deckId: share.deckId,
    userId: share.user.id,
    email: share.user.email,
    name: share.user.name ?? undefined,
    permission: share.permission,
    createdAt: share.createdAt,
    updatedAt: share.updatedAt,
  };
}

export function mapDeckDetail(deck: DeckWithShares): DeckDetail {
  return {
    id: deck.id,
    name: deck.name,
    description: deck.description ?? undefined,
    count: deck._count.cards,
    createdAt: deck.createdAt,
    updatedAt: deck.updatedAt,
    sharedUsers: deck.shares.map((share) => mapDeckShareSummary(share)),
  };
}

export async function hasExistingCards(
  prisma: PrismaService,
  cardIds: string[],
  userId: string,
): Promise<boolean> {
  const cards = await prisma.card.findMany({
    where: { id: { in: cardIds }, deck: { ownerId: userId } },
    select: { id: true },
  });

  return cards.length === cardIds.length;
}

export async function hasExistingChunks(
  prisma: PrismaService,
  chunkIds: string[],
  userId: string,
): Promise<boolean> {
  const chunks = await prisma.chunk.findMany({
    where: { id: { in: chunkIds }, deck: { ownerId: userId } },
    select: { id: true },
  });

  return chunks.length === chunkIds.length;
}

export async function attachCardsToDeck(
  client: DeckPersistenceClient,
  deckId: string,
  cardIds: string[],
): Promise<void> {
  if (cardIds.length === 0) {
    return;
  }

  await client.chunkCard.deleteMany({
    where: { cardId: { in: cardIds } },
  });

  await client.card.updateMany({
    where: { id: { in: cardIds } },
    data: { deckId },
  });
}

export async function replaceDeckCards(
  client: DeckPersistenceClient,
  deckId: string,
  cardIds: string[],
): Promise<void> {
  await client.card.deleteMany({
    where: { deckId, id: { notIn: cardIds } },
  });

  await attachCardsToDeck(client, deckId, cardIds);
}

export async function attachChunksToDeck(
  client: DeckPersistenceClient,
  deckId: string,
  chunkIds: string[],
): Promise<void> {
  if (chunkIds.length === 0) {
    return;
  }

  await client.chunk.updateMany({
    where: { id: { in: chunkIds } },
    data: { deckId },
  });
}

export async function replaceDeckChunks(
  client: DeckPersistenceClient,
  deckId: string,
  chunkIds: string[],
): Promise<void> {
  await client.chunk.deleteMany({
    where: { deckId, id: { notIn: chunkIds } },
  });

  await attachChunksToDeck(client, deckId, chunkIds);
}

export async function resolveShareTarget(
  prisma: PrismaService,
  identifier: string,
): Promise<
  | {
      status: 'found';
      user: { id: string; email: string; name: string | null };
    }
  | { status: 'not_found' }
  | { status: 'ambiguous' }
> {
  const normalized = identifier.trim();
  const emailCandidate = normalized.toLowerCase();

  const byEmail = await prisma.user.findUnique({
    where: { email: emailCandidate },
    select: { id: true, email: true, name: true },
  });

  if (byEmail) {
    return { status: 'found', user: byEmail };
  }

  const byName = await prisma.user.findMany({
    where: { name: normalized },
    select: { id: true, email: true, name: true },
  });

  if (byName.length === 0) {
    return { status: 'not_found' };
  }

  if (byName.length > 1) {
    return { status: 'ambiguous' };
  }

  return { status: 'found', user: byName[0] };
}

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
  'card' | 'chunk' | 'chunkReviewState' | 'deck' | 'deckShare' | 'user'
>;

const DECK_INBOX_CHUNK_TITLE = 'Deck Inbox';

async function ensureDeckInboxMembership(
  client: DeckPersistenceClient,
  deckId: string,
  cardIds: string[],
  ownerId?: string,
): Promise<void> {
  const cardsWithoutChunkInDeck = await client.card.findMany({
    where: {
      id: { in: cardIds },
      deckId,
      chunkCards: {
        none: {
          chunk: {
            deckId,
          },
        },
      },
    },
    select: { id: true },
    orderBy: { createdAt: 'asc' },
  });

  if (cardsWithoutChunkInDeck.length === 0) {
    return;
  }

  const inboxChunk = await client.chunk.findFirst({
    where: { deckId, title: DECK_INBOX_CHUNK_TITLE },
    include: {
      chunkCards: {
        select: { sequenceIndex: true },
        orderBy: { sequenceIndex: 'desc' },
        take: 1,
      },
    },
  });

  if (!inboxChunk) {
    const createdInboxChunk = await client.chunk.create({
      data: {
        ownerId: ownerId ?? null,
        deckId,
        title: DECK_INBOX_CHUNK_TITLE,
        position: 0,
        chunkCards: {
          create: cardsWithoutChunkInDeck.map((card, index) => ({
            cardId: card.id,
            sequenceIndex: index,
          })),
        },
      },
      select: {
        id: true,
      },
    });

    await client.chunkReviewState.upsert({
      where: { chunkId: createdInboxChunk.id },
      update: {
        due: new Date(),
        consecutiveSuccessCount: 0,
        lastGrade: null,
      },
      create: {
        chunkId: createdInboxChunk.id,
        due: new Date(),
        consecutiveSuccessCount: 0,
        lastGrade: null,
      },
    });

    return;
  }

  const lastSequenceIndex = inboxChunk.chunkCards[0]?.sequenceIndex ?? -1;
  await client.chunk.update({
    where: { id: inboxChunk.id },
    data: {
      chunkCards: {
        create: cardsWithoutChunkInDeck.map((card, index) => ({
          cardId: card.id,
          sequenceIndex: lastSequenceIndex + index + 1,
        })),
      },
    },
  });

  await client.chunkReviewState.upsert({
    where: { chunkId: inboxChunk.id },
    update: {
      due: new Date(),
      consecutiveSuccessCount: 0,
      lastGrade: null,
    },
    create: {
      chunkId: inboxChunk.id,
      due: new Date(),
      consecutiveSuccessCount: 0,
      lastGrade: null,
    },
  });
}

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
    where: {
      id: { in: cardIds },
      OR: [{ ownerId: userId }, { deck: { ownerId: userId } }],
    },
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
    where: {
      id: { in: chunkIds },
      OR: [{ ownerId: userId }, { deck: { ownerId: userId } }],
    },
    select: { id: true },
  });

  return chunks.length === chunkIds.length;
}

export async function moveCardsToDeck(
  client: DeckPersistenceClient,
  deckId: string,
  cardIds: string[],
  ownerId?: string,
): Promise<void> {
  if (cardIds.length === 0) {
    return;
  }

  await client.card.updateMany({
    where: { id: { in: cardIds } },
    data: { deckId },
  });

  await ensureDeckInboxMembership(client, deckId, cardIds, ownerId);
}

export async function replaceDeckCards(
  client: DeckPersistenceClient,
  deckId: string,
  cardIds: string[],
  ownerId?: string,
): Promise<void> {
  await client.card.updateMany({
    where: { deckId, id: { notIn: cardIds } },
    data: { deckId: null },
  });

  await moveCardsToDeck(client, deckId, cardIds, ownerId);
}

export async function moveChunksToDeck(
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

  const now = new Date();
  await Promise.all(
    chunkIds.map(async (chunkId) =>
      client.chunkReviewState.upsert({
        where: { chunkId },
        update: {
          due: now,
          consecutiveSuccessCount: 0,
          lastGrade: null,
        },
        create: {
          chunkId,
          due: now,
          consecutiveSuccessCount: 0,
          lastGrade: null,
        },
      }),
    ),
  );
}

export async function replaceDeckChunks(
  client: DeckPersistenceClient,
  deckId: string,
  chunkIds: string[],
): Promise<void> {
  await client.chunk.updateMany({
    where: { deckId, id: { notIn: chunkIds } },
    data: { deckId: null },
  });

  await moveChunksToDeck(client, deckId, chunkIds);
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

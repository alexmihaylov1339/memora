import type { PrismaService } from '../../prisma/prisma.service';
import { getAccessibleDeckIds } from '../decks/deck-access';
import type { ChunkWithCards } from './chunk-progress';

export async function findAccessibleDeckIds(
  prisma: PrismaService,
  userId: string,
): Promise<string[]> {
  return getAccessibleDeckIds(prisma, userId);
}

export async function canAccessDeck(
  prisma: PrismaService,
  userId: string,
  deckId: string,
): Promise<boolean> {
  const deckIds = await findAccessibleDeckIds(prisma, userId);

  return deckIds.includes(deckId);
}

export async function findChunkWithCards(
  prisma: PrismaService,
  chunkId: string,
): Promise<ChunkWithCards | null> {
  return (await prisma.chunk.findUnique({
    where: { id: chunkId },
    select: {
      id: true,
      deckId: true,
      title: true,
      position: true,
      deck: {
        select: { reviewIntervalHours: true },
      },
      chunkCards: {
        orderBy: { sequenceIndex: 'asc' },
        select: {
          cardId: true,
          sequenceIndex: true,
          card: {
            select: {
              id: true,
              kind: true,
              fields: true,
              createdAt: true,
            },
          },
        },
      },
    },
  })) as ChunkWithCards | null;
}

export async function findChunksWithReviewState(
  prisma: PrismaService,
  userId: string,
  deckId?: string,
): Promise<ChunkWithCards[]> {
  const deckIds = await findAccessibleDeckIds(prisma, userId);
  const scopedDeckIds = deckId
    ? deckIds.filter((id) => id === deckId)
    : deckIds;

  if (scopedDeckIds.length === 0) {
    return [];
  }

  return (await prisma.chunk.findMany({
    where: { deckId: { in: scopedDeckIds } },
    orderBy: [{ position: 'asc' }, { id: 'asc' }],
    select: {
      id: true,
      deckId: true,
      title: true,
      position: true,
      deck: {
        select: { reviewIntervalHours: true },
      },
      reviewState: {
        select: {
          id: true,
          chunkId: true,
          due: true,
          consecutiveSuccessCount: true,
          lastGrade: true,
          createdAt: true,
          updatedAt: true,
        },
      },
      chunkCards: {
        orderBy: { sequenceIndex: 'asc' },
        select: {
          cardId: true,
          sequenceIndex: true,
          card: {
            select: {
              id: true,
              kind: true,
              fields: true,
              createdAt: true,
            },
          },
        },
      },
    },
  })) as unknown as ChunkWithCards[];
}

export async function findChunkByCardId(
  prisma: PrismaService,
  cardId: string,
  userId: string,
  deckId?: string,
): Promise<ChunkWithCards | null> {
  const chunks = await findChunksByCardId(prisma, cardId, userId, deckId);

  return chunks[0] ?? null;
}

export async function findChunksByCardId(
  prisma: PrismaService,
  cardId: string,
  userId: string,
  deckId?: string,
): Promise<ChunkWithCards[]> {
  const deckIds = await findAccessibleDeckIds(prisma, userId);
  const scopedDeckIds = deckId
    ? deckIds.filter((id) => id === deckId)
    : deckIds;

  if (scopedDeckIds.length === 0) {
    return [];
  }

  return (await prisma.chunk.findMany({
    where: {
      chunkCards: { some: { cardId } },
      deckId: { in: scopedDeckIds },
    },
    orderBy: [{ position: 'asc' }, { id: 'asc' }],
    select: {
      id: true,
      deckId: true,
      title: true,
      position: true,
      deck: {
        select: { reviewIntervalHours: true },
      },
      reviewState: {
        select: {
          id: true,
          chunkId: true,
          due: true,
          consecutiveSuccessCount: true,
          lastGrade: true,
          createdAt: true,
          updatedAt: true,
        },
      },
      chunkCards: {
        orderBy: { sequenceIndex: 'asc' },
        select: {
          cardId: true,
          sequenceIndex: true,
          card: {
            select: {
              id: true,
              kind: true,
              fields: true,
              createdAt: true,
            },
          },
        },
      },
    },
  })) as ChunkWithCards[];
}

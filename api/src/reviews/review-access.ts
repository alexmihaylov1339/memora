import type { PrismaService } from '../../prisma/prisma.service';
import { getAccessibleDeckIds } from '../decks/deck-access';
import type { ChunkWithCards } from './chunk-progress';

export async function findAccessibleDeckIds(
  prisma: PrismaService,
  userId: string,
): Promise<string[]> {
  return getAccessibleDeckIds(prisma, userId);
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
): Promise<ChunkWithCards[]> {
  const deckIds = await findAccessibleDeckIds(prisma, userId);

  if (deckIds.length === 0) {
    return [];
  }

  return (await prisma.chunk.findMany({
    where: { deckId: { in: deckIds } },
    select: {
      id: true,
      deckId: true,
      title: true,
      position: true,
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
): Promise<ChunkWithCards | null> {
  const deckIds = await findAccessibleDeckIds(prisma, userId);

  if (deckIds.length === 0) {
    return null;
  }

  return (await prisma.chunk.findFirst({
    where: {
      chunkCards: { some: { cardId } },
      deckId: { in: deckIds },
    },
    select: {
      id: true,
      deckId: true,
      title: true,
      position: true,
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
  })) as ChunkWithCards | null;
}

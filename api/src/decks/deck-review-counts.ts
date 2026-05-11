import { PrismaService } from '../../prisma/prisma.service';
import {
  deriveChunkReviewState,
  type ChunkWithCards,
} from '../reviews/chunk-progress';

export async function getDueCardCountsByDeck(
  prisma: PrismaService,
  deckIds: string[],
  now = new Date(),
): Promise<Map<string, number>> {
  if (deckIds.length === 0) {
    return new Map();
  }

  const [chunks, unchunkedCards] = await Promise.all([
    prisma.chunk.findMany({
      where: { deckId: { in: deckIds } },
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
          },
        },
      },
    }),
    prisma.deckCard.findMany({
      where: {
        deckId: { in: deckIds },
        card: {
          chunkCards: {
            none: {
              chunk: {
                deckId: { in: deckIds },
              },
            },
          },
          state: {
            is: {
              due: { lte: now },
            },
          },
        },
      },
      select: { deckId: true },
    }),
  ]);

  const counts = (chunks as ChunkWithCards[]).reduce((deckCounts, chunk) => {
    const snapshot = deriveChunkReviewState(chunk, now);

    if (!snapshot.isDue || snapshot.hasMastery || !snapshot.currentCard) {
      return deckCounts;
    }

    deckCounts.set(chunk.deckId, (deckCounts.get(chunk.deckId) ?? 0) + 1);

    return deckCounts;
  }, new Map<string, number>());

  for (const membership of unchunkedCards) {
    counts.set(membership.deckId, (counts.get(membership.deckId) ?? 0) + 1);
  }

  return counts;
}

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

  const chunks = (await prisma.chunk.findMany({
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
  })) as ChunkWithCards[];

  return chunks.reduce((counts, chunk) => {
    const snapshot = deriveChunkReviewState(chunk, now);

    if (!snapshot.isDue || snapshot.hasMastery || !snapshot.currentCard) {
      return counts;
    }

    counts.set(chunk.deckId, (counts.get(chunk.deckId) ?? 0) + 1);

    return counts;
  }, new Map<string, number>());
}

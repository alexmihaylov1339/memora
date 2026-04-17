import type { Prisma } from '@prisma/client';
import type { ChunkWithCards } from './chunk-progress';
import { deriveChunkReviewState } from './chunk-progress';

export type ReviewQueueItem = {
  cardId: string;
  deckId: string;
  chunkId: string;
  chunkTitle: string;
  chunkPosition: number;
  positionInChunk: number;
  due: Date;
  kind: string;
  fields: Prisma.JsonValue;
  cardCreatedAt: Date;
  consecutiveSuccessCount: number;
};

export function buildEligibleQueueItems(
  chunks: ChunkWithCards[],
  now: Date,
): ReviewQueueItem[] {
  const items = chunks
    .map((chunk) => {
      const snapshot = deriveChunkReviewState(chunk, now);
      const currentCard =
        snapshot.currentCard === null
          ? null
          : chunk.chunkCards[snapshot.currentCard.sequenceIndex]?.card;

      if (
        !snapshot.isDue ||
        snapshot.hasMastery ||
        snapshot.currentCard === null ||
        !currentCard
      ) {
        return null;
      }

      return {
        cardId: currentCard.id,
        deckId: chunk.deckId,
        chunkId: chunk.id,
        chunkTitle: chunk.title,
        chunkPosition: chunk.position,
        positionInChunk: snapshot.currentCard.sequenceIndex,
        due: snapshot.due,
        kind: currentCard.kind,
        fields: currentCard.fields,
        cardCreatedAt: currentCard.createdAt,
        consecutiveSuccessCount: snapshot.consecutiveSuccessCount,
      } satisfies ReviewQueueItem;
    })
    .filter((item): item is ReviewQueueItem => item !== null);

  items.sort((left, right) => {
    const dueDiff = left.due.getTime() - right.due.getTime();
    if (dueDiff !== 0) {
      return dueDiff;
    }

    const createdAtDiff =
      left.cardCreatedAt.getTime() - right.cardCreatedAt.getTime();
    if (createdAtDiff !== 0) {
      return createdAtDiff;
    }

    return left.cardId.localeCompare(right.cardId);
  });

  return items;
}

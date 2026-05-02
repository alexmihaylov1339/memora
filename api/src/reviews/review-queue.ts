import type { Prisma } from '@prisma/client';
import { isNotNull, isNull } from '../common/utils/type-guards';
import type { ChunkWithCards } from './chunk-progress';
import { deriveChunkReviewState } from './chunk-progress';
import { resolveReviewKindSupport } from './review-kind-adapter';
import type { ReviewUnsupportedReason } from './review-kind-adapter';

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
  isReviewSupported: boolean;
  reviewUnsupportedReason: ReviewUnsupportedReason | null;
  cardCreatedAt: Date;
  consecutiveSuccessCount: number;
};

export type PracticeItem = Omit<
  ReviewQueueItem,
  'due' | 'consecutiveSuccessCount'
>;

type SortableReviewQueueItem = ReviewQueueItem & {
  isImmediateRetryPending: boolean;
  reviewOrder: number;
};

export function buildEligibleQueueItems(
  chunks: ChunkWithCards[],
  now: Date,
): ReviewQueueItem[] {
  const items = chunks
    .flatMap((chunk) => {
      const snapshot = deriveChunkReviewState(chunk, now);

      if (
        !snapshot.isDue ||
        snapshot.hasMastery ||
        isNull(snapshot.currentCard)
      ) {
        return [];
      }

      return buildDueChunkQueueItems(chunk, snapshot);
    })
    .filter(isNotNull);

  items.sort((left, right) => {
    const dueDiff = left.due.getTime() - right.due.getTime();
    if (dueDiff !== 0) {
      return dueDiff;
    }

    if (left.isImmediateRetryPending !== right.isImmediateRetryPending) {
      return left.isImmediateRetryPending ? 1 : -1;
    }

    const chunkPositionDiff = left.chunkPosition - right.chunkPosition;
    if (chunkPositionDiff !== 0) {
      return chunkPositionDiff;
    }

    const reviewOrderDiff = left.reviewOrder - right.reviewOrder;
    if (reviewOrderDiff !== 0) {
      return reviewOrderDiff;
    }

    return left.cardId.localeCompare(right.cardId);
  });

  return items.map(toReviewQueueItem);
}

function buildDueChunkQueueItems(
  chunk: ChunkWithCards,
  snapshot: ReturnType<typeof deriveChunkReviewState>,
): Array<SortableReviewQueueItem | null> {
  if (isNull(snapshot.currentCard)) {
    return [];
  }

  const currentCardIndex = chunk.chunkCards.findIndex(
    (chunkCard) =>
      chunkCard.sequenceIndex === snapshot.currentCard?.sequenceIndex,
  );

  if (currentCardIndex < 0) {
    return [];
  }

  return chunk.chunkCards.map((_, offset) => {
    const chunkCard =
      chunk.chunkCards[(currentCardIndex + offset) % chunk.chunkCards.length];

    if (!chunkCard?.card) {
      return null;
    }

    const reviewKindSupport = resolveReviewKindSupport(
      chunkCard.card.kind,
      chunkCard.card.fields,
    );

    return {
      cardId: chunkCard.card.id,
      deckId: chunk.deckId,
      chunkId: chunk.id,
      chunkTitle: chunk.title,
      chunkPosition: chunk.position,
      positionInChunk: chunkCard.sequenceIndex,
      due: snapshot.due,
      kind: chunkCard.card.kind,
      fields: chunkCard.card.fields,
      isReviewSupported: reviewKindSupport.isReviewSupported,
      reviewUnsupportedReason: reviewKindSupport.reviewUnsupportedReason,
      cardCreatedAt: chunkCard.card.createdAt,
      consecutiveSuccessCount: snapshot.consecutiveSuccessCount,
      isImmediateRetryPending:
        snapshot.lastGrade === 'again' || snapshot.lastGrade === 'hard',
      reviewOrder: offset,
    } satisfies SortableReviewQueueItem;
  });
}

function toReviewQueueItem(item: SortableReviewQueueItem): ReviewQueueItem {
  return {
    cardId: item.cardId,
    deckId: item.deckId,
    chunkId: item.chunkId,
    chunkTitle: item.chunkTitle,
    chunkPosition: item.chunkPosition,
    positionInChunk: item.positionInChunk,
    due: item.due,
    kind: item.kind,
    fields: item.fields,
    isReviewSupported: item.isReviewSupported,
    reviewUnsupportedReason: item.reviewUnsupportedReason,
    cardCreatedAt: item.cardCreatedAt,
    consecutiveSuccessCount: item.consecutiveSuccessCount,
  };
}

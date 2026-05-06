import type { Grade, Prisma } from '@prisma/client';
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
  isImmediateRetryPending?: boolean;
};

export interface StandaloneCardQueueRecord {
  id: string;
  deckId: string | null;
  kind: string;
  fields: Prisma.JsonValue;
  createdAt: Date;
  state: {
    due: Date;
    consecutiveSuccessCount: number;
    lastGrade: Grade | null;
  } | null;
}

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

export function buildStandaloneCardQueueItems(
  cards: StandaloneCardQueueRecord[],
): ReviewQueueItem[] {
  return cards
    .filter((card) => card.deckId && card.state)
    .map((card) => {
      const reviewKindSupport = resolveReviewKindSupport(
        card.kind,
        card.fields,
      );

      return {
        cardId: card.id,
        deckId: card.deckId as string,
        chunkId: `standalone:${card.id}`,
        chunkTitle: 'Standalone Card',
        chunkPosition: 0,
        positionInChunk: 0,
        due: card.state!.due,
        kind: card.kind,
        fields: card.fields,
        isReviewSupported: reviewKindSupport.isReviewSupported,
        reviewUnsupportedReason: reviewKindSupport.reviewUnsupportedReason,
        cardCreatedAt: card.createdAt,
        consecutiveSuccessCount: card.state!.consecutiveSuccessCount,
        isImmediateRetryPending: card.state!.lastGrade === 'again',
      } satisfies ReviewQueueItem;
    })
    .sort(compareReviewQueueItems);
}

export function buildFullQueueItems(
  chunkItems: ReviewQueueItem[],
  standaloneItems: ReviewQueueItem[],
): ReviewQueueItem[] {
  return [...chunkItems, ...standaloneItems].sort(compareReviewQueueItems);
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

  const chunkCard = chunk.chunkCards[currentCardIndex];

  if (!chunkCard?.card) {
    return [];
  }

  const reviewKindSupport = resolveReviewKindSupport(
    chunkCard.card.kind,
    chunkCard.card.fields,
  );

  return [
    {
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
      isImmediateRetryPending: snapshot.lastGrade === 'again',
      reviewOrder: 0,
    },
  ];
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
    isImmediateRetryPending: item.isImmediateRetryPending,
  };
}

function compareReviewQueueItems(
  left: ReviewQueueItem,
  right: ReviewQueueItem,
): number {
  const dueDiff = left.due.getTime() - right.due.getTime();
  if (dueDiff !== 0) {
    return dueDiff;
  }

  if (left.isImmediateRetryPending !== right.isImmediateRetryPending) {
    return left.isImmediateRetryPending ? 1 : -1;
  }

  const createdDiff =
    left.cardCreatedAt.getTime() - right.cardCreatedAt.getTime();
  if (createdDiff !== 0) {
    return createdDiff;
  }

  return left.cardId.localeCompare(right.cardId);
}

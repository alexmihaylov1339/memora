import type { Prisma } from '@prisma/client';
import type { ReviewQueueItem } from '../reviews.service';

export interface ReviewQueueItemDto {
  cardId: string;
  deckId: string;
  chunkId: string;
  chunkTitle: string;
  chunkPosition: number;
  positionInChunk: number;
  due: Date;
  kind: string;
  fields: Prisma.JsonValue;
  consecutiveSuccessCount: number;
}

export interface ReviewQueueResponseDto {
  items: ReviewQueueItemDto[];
}

export function serializeReviewQueueItem(
  item: ReviewQueueItem,
): ReviewQueueItemDto {
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
    consecutiveSuccessCount: item.consecutiveSuccessCount,
  };
}

export function serializeReviewQueueResponse(
  items: ReviewQueueItem[],
): ReviewQueueResponseDto {
  return {
    items: items.map(serializeReviewQueueItem),
  };
}

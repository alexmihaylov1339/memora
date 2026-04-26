import type { Prisma } from '@prisma/client';
import type { ReviewQueueItem } from '../reviews.service';
import { serializeDate } from './review-response-serialization';
import type { ReviewUnsupportedReason } from '../review-kind-adapter';

export interface ReviewQueueItemDto {
  cardId: string;
  deckId: string;
  chunkId: string;
  chunkTitle: string;
  chunkPosition: number;
  positionInChunk: number;
  due: string;
  kind: string;
  fields: Prisma.JsonValue;
  isReviewSupported: boolean;
  reviewUnsupportedReason: ReviewUnsupportedReason | null;
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
    due: serializeDate(item.due),
    kind: item.kind,
    fields: item.fields,
    isReviewSupported: item.isReviewSupported,
    reviewUnsupportedReason: item.reviewUnsupportedReason,
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

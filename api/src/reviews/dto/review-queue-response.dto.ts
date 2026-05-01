import type { Prisma } from '@prisma/client';
import type { PracticeItem, ReviewQueueItem } from '../reviews.service';
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

export interface PracticeItemDto {
  cardId: string;
  deckId: string;
  chunkId: string;
  chunkTitle: string;
  chunkPosition: number;
  positionInChunk: number;
  kind: string;
  fields: Prisma.JsonValue;
  isReviewSupported: boolean;
  reviewUnsupportedReason: ReviewUnsupportedReason | null;
}

export interface PracticeResponseDto {
  items: PracticeItemDto[];
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

export function serializePracticeItem(item: PracticeItem): PracticeItemDto {
  return {
    cardId: item.cardId,
    deckId: item.deckId,
    chunkId: item.chunkId,
    chunkTitle: item.chunkTitle,
    chunkPosition: item.chunkPosition,
    positionInChunk: item.positionInChunk,
    kind: item.kind,
    fields: item.fields,
    isReviewSupported: item.isReviewSupported,
    reviewUnsupportedReason: item.reviewUnsupportedReason,
  };
}

export function serializeReviewQueueResponse(
  items: ReviewQueueItem[],
): ReviewQueueResponseDto {
  return {
    items: items.map(serializeReviewQueueItem),
  };
}

export function serializePracticeResponse(
  items: PracticeItem[],
): PracticeResponseDto {
  return {
    items: items.map(serializePracticeItem),
  };
}

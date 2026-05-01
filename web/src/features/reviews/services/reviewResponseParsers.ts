import { isBoolean, isNull, isNumber, isObjectRecord, isString } from '@shared/utils';
import { REVIEW_UNSUPPORTED_REASONS } from '../types';
import type {
  PracticeResponse,
  ReviewQueueItem,
  ReviewQueueResponse,
  ReviewRenderableItem,
  ReviewUnsupportedReason,
} from '../types';

function parseUnsupportedReason(value: unknown): ReviewUnsupportedReason | null {
  if (isNull(value)) {
    return null;
  }

  if (
    value === REVIEW_UNSUPPORTED_REASONS.kindNotReviewEnabled ||
    value === REVIEW_UNSUPPORTED_REASONS.invalidPayload
  ) {
    return value;
  }

  throw new Error('Invalid reviewUnsupportedReason in review queue response');
}

function parseReviewRenderableItem(value: unknown): ReviewRenderableItem {
  if (!isObjectRecord(value)) {
    throw new Error('Invalid review queue item shape');
  }

  const {
    cardId,
    deckId,
    chunkId,
    chunkTitle,
    chunkPosition,
    positionInChunk,
    kind,
    fields,
    isReviewSupported,
    reviewUnsupportedReason,
  } = value;

  if (
    !isString(cardId) ||
    !isString(deckId) ||
    !isString(chunkId) ||
    !isString(chunkTitle) ||
    !isNumber(chunkPosition) ||
    !isNumber(positionInChunk) ||
    !isString(kind) ||
    !isObjectRecord(fields) ||
    !isBoolean(isReviewSupported)
  ) {
    throw new Error('Invalid review queue item contract');
  }

  return {
    cardId,
    deckId,
    chunkId,
    chunkTitle,
    chunkPosition,
    positionInChunk,
    kind,
    fields,
    isReviewSupported,
    reviewUnsupportedReason: parseUnsupportedReason(reviewUnsupportedReason),
  };
}

function parseReviewQueueItem(value: unknown): ReviewQueueItem {
  const item = parseReviewRenderableItem(value);

  if (
    !isObjectRecord(value) ||
    !isString(value.due) ||
    !isNumber(value.consecutiveSuccessCount)
  ) {
    throw new Error('Invalid review queue item contract');
  }

  return {
    ...item,
    due: value.due,
    consecutiveSuccessCount: value.consecutiveSuccessCount,
  };
}

export function parseReviewQueueResponse(value: unknown): ReviewQueueResponse {
  if (!isObjectRecord(value) || !Array.isArray(value.items)) {
    throw new Error('Invalid review queue response');
  }

  return {
    items: value.items.map(parseReviewQueueItem),
  };
}

export function parsePracticeResponse(value: unknown): PracticeResponse {
  if (!isObjectRecord(value) || !Array.isArray(value.items)) {
    throw new Error('Invalid practice response');
  }

  return {
    items: value.items.map(parseReviewRenderableItem),
  };
}

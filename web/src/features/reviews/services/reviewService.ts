import { ManageService, HTTP_METHODS, getAuthHeaders } from '@shared/services';
import { isBoolean, isNull, isNumber, isObjectRecord, isString } from '@shared/utils';
import { REVIEW_UNSUPPORTED_REASONS } from '../types';
import type {
  GradeReviewDto,
  GradeReviewResponse,
  ReviewCardIdParams,
  ReviewQueueItem,
  ReviewQueueResponse,
  ReviewUnsupportedReason,
} from '../types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || '';
const api = ManageService(API_URL);

const REVIEW_ENDPOINTS = {
  QUEUE: '/v1/reviews/queue',
  GRADE: (cardId: string) => `/v1/reviews/${cardId}/grade`,
} as const;

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

function parseReviewQueueItem(value: unknown): ReviewQueueItem {
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
    due,
    kind,
    fields,
    isReviewSupported,
    reviewUnsupportedReason,
    consecutiveSuccessCount,
  } = value;

  if (
    !isString(cardId) ||
    !isString(deckId) ||
    !isString(chunkId) ||
    !isString(chunkTitle) ||
    !isNumber(chunkPosition) ||
    !isNumber(positionInChunk) ||
    !isString(due) ||
    !isString(kind) ||
    !isObjectRecord(fields) ||
    !isBoolean(isReviewSupported) ||
    !isNumber(consecutiveSuccessCount)
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
    due,
    kind,
    fields,
    isReviewSupported,
    reviewUnsupportedReason: parseUnsupportedReason(reviewUnsupportedReason),
    consecutiveSuccessCount,
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

export const reviewService = {
  async getQueue() {
    const result = await api
      .prepareRequest(REVIEW_ENDPOINTS.QUEUE, HTTP_METHODS.GET)
      .setHeaders(getAuthHeaders())
      .execRequest<unknown>();

    return parseReviewQueueResponse(result);
  },

  grade(params: ReviewCardIdParams & GradeReviewDto) {
    const { cardId, grade } = params;

    return api
      .prepareRequest(REVIEW_ENDPOINTS.GRADE(cardId), HTTP_METHODS.POST)
      .setHeaders(getAuthHeaders())
      .setBody({ grade })
      .execRequest<GradeReviewResponse>();
  },
};

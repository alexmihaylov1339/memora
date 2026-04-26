import { isString } from '@shared/utils';
import type { ReviewQueueItem } from './types';

export interface BasicReviewCardFields {
  front: string;
  back: string;
}

type SupportedReviewRenderer = {
  renderer: 'basic';
  basicCardFields: BasicReviewCardFields;
};

type UnsupportedReviewRenderer = {
  renderer: 'unsupported';
  reason: string;
};

export type ReviewRendererResolution =
  | SupportedReviewRenderer
  | UnsupportedReviewRenderer;

function parseBasicReviewFields(
  item: ReviewQueueItem,
): BasicReviewCardFields | null {
  const front = item.fields.front;
  const back = item.fields.back;

  if (!isString(front) || !isString(back)) {
    return null;
  }

  const normalizedFront = front.trim();
  const normalizedBack = back.trim();

  if (!normalizedFront || !normalizedBack) {
    return null;
  }

  return {
    front: normalizedFront,
    back: normalizedBack,
  };
}

export function resolveReviewRenderer(
  item: ReviewQueueItem | null,
): ReviewRendererResolution | null {
  if (!item) {
    return null;
  }

  if (item.isReviewSupported === false) {
    return {
      renderer: 'unsupported',
      reason: item.reviewUnsupportedReason ?? 'kind_not_review_enabled',
    };
  }

  if (item.kind === 'basic') {
    const basicCardFields = parseBasicReviewFields(item);
    if (!basicCardFields) {
      return {
        renderer: 'unsupported',
        reason: 'invalid_payload',
      };
    }

    return {
      renderer: 'basic',
      basicCardFields,
    };
  }

  return {
    renderer: 'unsupported',
    reason: item.reviewUnsupportedReason ?? 'kind_not_review_enabled',
  };
}


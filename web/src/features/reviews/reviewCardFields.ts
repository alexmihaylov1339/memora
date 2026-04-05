import type { ReviewQueueItem } from './types';

export interface BasicReviewCardFields {
  front: string;
  back: string;
}

export function getBasicReviewCardFields(
  item: ReviewQueueItem | null,
): BasicReviewCardFields | null {
  if (!item || item.kind !== 'basic') {
    return null;
  }

  const front = item.fields.front;
  const back = item.fields.back;

  if (typeof front !== 'string' || typeof back !== 'string') {
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

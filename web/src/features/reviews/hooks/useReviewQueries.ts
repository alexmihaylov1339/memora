import { useServiceQuery, type UseServiceQueryOptions } from '@shared/hooks';
import { reviewService } from '../services';
import type {
  PracticeResponse,
  ReviewQueueResponse,
  WhatDidYouHearRoundResponse,
} from '../types';

export const REVIEW_QUERY_KEYS = {
  practice: (deckId: string) => ['reviews', 'practice', deckId],
  queue: (deckId: string) => ['reviews', 'queue', deckId],
  whatDidYouHear: (deckId: string) => ['reviews', 'what-did-you-hear', deckId],
};

export function useReviewQueueQuery(
  deckId: string | null,
  options?: UseServiceQueryOptions<ReviewQueueResponse>,
) {
  return useServiceQuery(
    deckId ? REVIEW_QUERY_KEYS.queue(deckId) : ['reviews', 'queue', 'missing'],
    () => reviewService.getQueue(deckId ?? ''),
    { ...options, enabled: Boolean(deckId) && options?.enabled !== false },
  );
}

export function usePracticeQuery(
  deckId: string | null,
  options?: UseServiceQueryOptions<PracticeResponse>,
) {
  return useServiceQuery(
    deckId
      ? REVIEW_QUERY_KEYS.practice(deckId)
      : ['reviews', 'practice', 'missing'],
    () => reviewService.getPractice(deckId ?? ''),
    { ...options, enabled: Boolean(deckId) && options?.enabled !== false },
  );
}

export function useWhatDidYouHearRoundQuery(
  deckId: string | null,
  options?: UseServiceQueryOptions<WhatDidYouHearRoundResponse>,
) {
  return useServiceQuery(
    deckId
      ? REVIEW_QUERY_KEYS.whatDidYouHear(deckId)
      : ['reviews', 'what-did-you-hear', 'missing'],
    () => reviewService.getWhatDidYouHearRound(deckId ?? ''),
    { ...options, enabled: Boolean(deckId) && options?.enabled !== false },
  );
}

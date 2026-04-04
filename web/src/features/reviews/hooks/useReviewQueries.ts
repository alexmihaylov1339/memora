import { useServiceQuery, type UseServiceQueryOptions } from '@shared/hooks';
import { reviewService } from '../services';
import type { ReviewQueueResponse } from '../types';

export const REVIEW_QUERY_KEYS = {
  queue: ['reviews', 'queue'],
};

export function useReviewQueueQuery(
  options?: UseServiceQueryOptions<ReviewQueueResponse>,
) {
  return useServiceQuery(
    REVIEW_QUERY_KEYS.queue,
    reviewService.getQueue,
    options,
  );
}

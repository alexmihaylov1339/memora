import type { Grade } from '@prisma/client';
import { createHash } from 'crypto';
import type { StructuredEventLogger } from '../common/telemetry/structured-events';
import { logStructuredEvent } from '../common/telemetry/structured-events';
import { isNull } from '../common/utils/type-guards';
import {
  REVIEW_KIND_UNSUPPORTED_REASONS,
  type ReviewUnsupportedReason,
} from './review-kind-adapter';
import type { ReviewQueueItem } from './review-queries';

export const REVIEW_OBSERVABILITY_EVENTS = {
  queueFetched: 'review_queue_fetched',
  graded: 'review_graded',
  unsupportedDetected: 'review_unsupported_detected',
} as const;

type UnsupportedReasonCounts = Record<ReviewUnsupportedReason, number>;

const EMPTY_UNSUPPORTED_REASON_COUNTS: UnsupportedReasonCounts = {
  [REVIEW_KIND_UNSUPPORTED_REASONS.kindNotReviewEnabled]: 0,
  [REVIEW_KIND_UNSUPPORTED_REASONS.invalidPayload]: 0,
};

export function hashUserId(userId: string): string {
  return createHash('sha256').update(userId).digest('hex').slice(0, 16);
}

export function getUnsupportedReasonCounts(
  items: ReviewQueueItem[],
): UnsupportedReasonCounts {
  const counts: UnsupportedReasonCounts = {
    ...EMPTY_UNSUPPORTED_REASON_COUNTS,
  };

  items.forEach((item) => {
    if (item.isReviewSupported || isNull(item.reviewUnsupportedReason)) {
      return;
    }

    counts[item.reviewUnsupportedReason] += 1;
  });

  return counts;
}

export function emitReviewQueueFetched(
  logger: StructuredEventLogger,
  input: {
    userId: string;
    items: ReviewQueueItem[];
    generatedAt: Date;
  },
): void {
  const unsupportedByReason = getUnsupportedReasonCounts(input.items);
  const unsupportedCount =
    unsupportedByReason[REVIEW_KIND_UNSUPPORTED_REASONS.kindNotReviewEnabled] +
    unsupportedByReason[REVIEW_KIND_UNSUPPORTED_REASONS.invalidPayload];

  logStructuredEvent(logger, REVIEW_OBSERVABILITY_EVENTS.queueFetched, {
    userIdHash: hashUserId(input.userId),
    queueSize: input.items.length,
    supportedCount: input.items.length - unsupportedCount,
    unsupportedCount,
    unsupportedByReason,
    generatedAt: input.generatedAt.toISOString(),
  });
}

export function emitReviewUnsupportedDetected(
  logger: StructuredEventLogger,
  input: {
    userId: string;
    reason: ReviewUnsupportedReason;
    source: 'queue' | 'grade_attempt';
    count?: number;
    cardId?: string;
    kind?: string;
    generatedAt: Date;
  },
): void {
  logStructuredEvent(logger, REVIEW_OBSERVABILITY_EVENTS.unsupportedDetected, {
    userIdHash: hashUserId(input.userId),
    source: input.source,
    reason: input.reason,
    count: input.count ?? 1,
    cardId: input.cardId,
    kind: input.kind,
    generatedAt: input.generatedAt.toISOString(),
  });
}

export function emitReviewGraded(
  logger: StructuredEventLogger,
  input: {
    userId: string;
    cardId: string;
    kind: string;
    grade: Grade;
    isReviewSupported: boolean;
    reviewUnsupportedReason: ReviewUnsupportedReason | null;
    latencyMs: number;
    generatedAt: Date;
  },
): void {
  logStructuredEvent(logger, REVIEW_OBSERVABILITY_EVENTS.graded, {
    userIdHash: hashUserId(input.userId),
    cardId: input.cardId,
    kind: input.kind,
    grade: input.grade,
    isReviewSupported: input.isReviewSupported,
    reviewUnsupportedReason: input.reviewUnsupportedReason,
    latencyMs: input.latencyMs,
    generatedAt: input.generatedAt.toISOString(),
  });
}

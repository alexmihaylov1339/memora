import type { Logger } from '@nestjs/common';
import type { Grade } from '@prisma/client';
import {
  REVIEW_KIND_UNSUPPORTED_REASONS,
  type ReviewUnsupportedReason,
} from './review-kind-adapter';
import {
  emitReviewGraded,
  emitReviewQueueFetched,
  emitReviewUnsupportedDetected,
  getUnsupportedReasonCounts,
} from './review-observability';
import type { ReviewQueueItem } from './review-queries';

interface ReviewObservabilityInput {
  generatedAt: Date;
  logger: Logger;
  userId: string;
}

interface ReviewGradedObservabilityInput extends ReviewObservabilityInput {
  cardId: string;
  grade: Grade;
  kind: string;
  latencyMs: number;
}

interface ReviewUnsupportedObservabilityInput extends ReviewObservabilityInput {
  cardId?: string;
  kind?: string;
  reason: ReviewUnsupportedReason;
  source: 'grade_attempt' | 'queue';
}

export function emitReviewQueueObservability(
  input: ReviewObservabilityInput & { items: ReviewQueueItem[] },
): void {
  runReviewObservabilitySafely(input.logger, 'review_queue_fetched', () => {
    emitReviewQueueFetched(input.logger, {
      userId: input.userId,
      items: input.items,
      generatedAt: input.generatedAt,
    });
  });

  const unsupportedByReason = getUnsupportedReasonCounts(input.items);
  emitQueueUnsupportedCount(
    input,
    REVIEW_KIND_UNSUPPORTED_REASONS.kindNotReviewEnabled,
    unsupportedByReason,
  );
  emitQueueUnsupportedCount(
    input,
    REVIEW_KIND_UNSUPPORTED_REASONS.invalidPayload,
    unsupportedByReason,
  );
}

export function emitReviewGradedObservability(
  input: ReviewGradedObservabilityInput,
): void {
  runReviewObservabilitySafely(input.logger, 'review_graded', () => {
    emitReviewGraded(input.logger, {
      userId: input.userId,
      cardId: input.cardId,
      kind: input.kind,
      grade: input.grade,
      isReviewSupported: true,
      reviewUnsupportedReason: null,
      latencyMs: input.latencyMs,
      generatedAt: input.generatedAt,
    });
  });
}

export function emitReviewUnsupportedObservability(
  input: ReviewUnsupportedObservabilityInput,
): void {
  runReviewObservabilitySafely(
    input.logger,
    'review_unsupported_detected',
    () => {
      emitReviewUnsupportedDetected(input.logger, {
        userId: input.userId,
        source: input.source,
        reason: input.reason,
        cardId: input.cardId,
        kind: input.kind,
        generatedAt: input.generatedAt,
      });
    },
  );
}

function emitQueueUnsupportedCount(
  input: ReviewObservabilityInput,
  reason: ReviewUnsupportedReason,
  unsupportedByReason: Record<ReviewUnsupportedReason, number>,
): void {
  const count = unsupportedByReason[reason];

  if (count <= 0) {
    return;
  }

  runReviewObservabilitySafely(
    input.logger,
    'review_unsupported_detected',
    () => {
      emitReviewUnsupportedDetected(input.logger, {
        userId: input.userId,
        reason,
        source: 'queue',
        count,
        generatedAt: input.generatedAt,
      });
    },
  );
}

function runReviewObservabilitySafely(
  logger: Logger,
  eventName: string,
  callback: () => void,
): void {
  try {
    callback();
  } catch (error) {
    const reason =
      error instanceof Error ? error.message : 'unknown_observability_error';
    logger.warn(
      `review_observability_emit_failed event=${eventName} reason=${reason}`,
    );
  }
}

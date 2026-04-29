import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import type { Grade } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import {
  computeNextDueAt,
  getChunkReviewIntervalHours,
  getNextConsecutiveSuccessCount,
} from './chunk-scheduling';
import { REVIEW_ERROR_MESSAGES } from './review-errors';
import {
  getChunkProgress as loadChunkProgress,
  getEligibleQueueItems as loadEligibleQueueItems,
  type ChunkProgressSnapshot,
  type ReviewQueueItem,
} from './review-queries';
import {
  buildGradeChunkReviewResult,
  persistGradeSideEffects,
  type GradeChunkReviewResult,
  type ReviewPersistenceClient,
} from './review-grade';
import { deriveChunkReviewState } from './chunk-progress';
import { findChunkByCardId } from './review-access';
import {
  findReviewableChunkForCard,
  getCurrentReviewChunkCard,
  getNextImmediateRetryPosition,
  resolveNextActionableItemAfterGrade,
} from './review-grade-flow';
import {
  resolveReviewKindSupport,
  REVIEW_KIND_UNSUPPORTED_REASONS,
} from './review-kind-adapter';
import {
  emitReviewGraded,
  emitReviewQueueFetched,
  emitReviewUnsupportedDetected,
  getUnsupportedReasonCounts,
} from './review-observability';
export type { ChunkProgressSnapshot, ReviewQueueItem } from './review-queries';
export type { GradeChunkReviewResult } from './review-grade';
@Injectable()
export class ReviewsService {
  private readonly logger = new Logger(ReviewsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async getChunkProgress(
    chunkId: string,
    now = new Date(),
  ): Promise<ChunkProgressSnapshot | null> {
    return loadChunkProgress(this.prisma, chunkId, now);
  }

  async getEligibleQueueItems(
    userId: string,
    now = new Date(),
  ): Promise<ReviewQueueItem[]> {
    const items = await loadEligibleQueueItems(this.prisma, userId, now);
    this.runObservabilitySafely('review_queue_fetched', () => {
      emitReviewQueueFetched(this.logger, {
        userId,
        items,
        generatedAt: now,
      });
    });

    const unsupportedByReason = getUnsupportedReasonCounts(items);
    if (
      unsupportedByReason[
        REVIEW_KIND_UNSUPPORTED_REASONS.kindNotReviewEnabled
      ] > 0
    ) {
      this.runObservabilitySafely('review_unsupported_detected', () => {
        emitReviewUnsupportedDetected(this.logger, {
          userId,
          reason: REVIEW_KIND_UNSUPPORTED_REASONS.kindNotReviewEnabled,
          source: 'queue',
          count:
            unsupportedByReason[
              REVIEW_KIND_UNSUPPORTED_REASONS.kindNotReviewEnabled
            ],
          generatedAt: now,
        });
      });
    }

    if (
      unsupportedByReason[REVIEW_KIND_UNSUPPORTED_REASONS.invalidPayload] > 0
    ) {
      this.runObservabilitySafely('review_unsupported_detected', () => {
        emitReviewUnsupportedDetected(this.logger, {
          userId,
          reason: REVIEW_KIND_UNSUPPORTED_REASONS.invalidPayload,
          source: 'queue',
          count:
            unsupportedByReason[REVIEW_KIND_UNSUPPORTED_REASONS.invalidPayload],
          generatedAt: now,
        });
      });
    }

    return items;
  }

  async applyGradeToCard(
    cardId: string,
    grade: Grade,
    userId: string,
    now = new Date(),
  ): Promise<GradeChunkReviewResult | null> {
    const startedAtMs = Date.now();
    const reviewable = await findReviewableChunkForCard(
      this.prisma,
      cardId,
      userId,
      now,
    );

    if (!reviewable) {
      return null;
    }

    const { chunk, snapshot, state } = reviewable;

    const currentChunkCard = getCurrentReviewChunkCard(chunk, snapshot);

    if (!currentChunkCard?.card) {
      return null;
    }
    const currentCard = currentChunkCard.card;

    const reviewKindSupport = resolveReviewKindSupport(
      currentCard.kind,
      currentCard.fields,
    );
    if (!reviewKindSupport.isReviewSupported) {
      this.runObservabilitySafely('review_unsupported_detected', () => {
        emitReviewUnsupportedDetected(this.logger, {
          userId,
          source: 'grade_attempt',
          reason:
            reviewKindSupport.reviewUnsupportedReason ??
            REVIEW_KIND_UNSUPPORTED_REASONS.kindNotReviewEnabled,
          cardId,
          kind: currentCard.kind,
          generatedAt: now,
        });
      });
      return null;
    }

    const currentCardMode = currentCard.kind;

    const isImmediateRetry = grade === 'again' || grade === 'hard';
    const wasSuccessful = !isImmediateRetry;
    const nextConsecutiveSuccessCount = isImmediateRetry
      ? getNextImmediateRetryPosition(snapshot)
      : getNextConsecutiveSuccessCount(
          snapshot.consecutiveSuccessCount,
          wasSuccessful,
        );
    const intervalHours = isImmediateRetry
      ? 0
      : getChunkReviewIntervalHours(nextConsecutiveSuccessCount);
    const nextDue = computeNextDueAt(now, intervalHours);

    const existingCardState = await this.prisma.reviewState.findUnique({
      where: { cardId },
    });

    await this.prisma.$transaction(async (tx) => {
      await persistGradeSideEffects(tx as ReviewPersistenceClient, {
        cardId,
        chunkId: chunk.id,
        now,
        nextDue,
        nextConsecutiveSuccessCount,
        grade,
        intervalHours,
        wasSuccessful,
        existingCardState,
        mode: currentCardMode,
      });
    });

    const nextSnapshot = deriveChunkReviewState(chunk, now, {
      ...state,
      due: nextDue,
      consecutiveSuccessCount: nextConsecutiveSuccessCount,
      lastGrade: grade,
      updatedAt: now,
    });
    const nextActionableItem = await resolveNextActionableItemAfterGrade(
      this.prisma,
      {
        cardId,
        chunk,
        isImmediateRetry,
        nextSnapshot,
        now,
        userId,
      },
    );

    this.runObservabilitySafely('review_graded', () => {
      emitReviewGraded(this.logger, {
        userId,
        cardId,
        kind: currentCardMode,
        grade,
        isReviewSupported: true,
        reviewUnsupportedReason: null,
        latencyMs: Date.now() - startedAtMs,
        generatedAt: now,
      });
    });

    return buildGradeChunkReviewResult({
      cardId,
      grade,
      wasSuccessful,
      snapshot,
      nextConsecutiveSuccessCount,
      nextDue,
      intervalHours,
      nextActionableItem,
    });
  }

  async gradeReview(
    cardId: string,
    grade: Grade,
    userId: string,
    now = new Date(),
  ): Promise<GradeChunkReviewResult> {
    const result = await this.applyGradeToCard(cardId, grade, userId, now);

    if (result) {
      return result;
    }

    const chunk = await findChunkByCardId(this.prisma, cardId, userId);

    if (!chunk) {
      throw new NotFoundException(REVIEW_ERROR_MESSAGES.cardNotFound);
    }

    throw new BadRequestException(REVIEW_ERROR_MESSAGES.cardNotReviewable);
  }

  private runObservabilitySafely(
    eventName: string,
    callback: () => void,
  ): void {
    try {
      callback();
    } catch (error) {
      const reason =
        error instanceof Error ? error.message : 'unknown_observability_error';
      this.logger.warn(
        `review_observability_emit_failed event=${eventName} reason=${reason}`,
      );
    }
  }
}

import type { Logger } from '@nestjs/common';
import type { Grade } from '@prisma/client';
import type { PrismaService } from '../../prisma/prisma.service';
import { resolveChunkReviewIntervalHours } from './chunk-scheduling';
import { deriveChunkReviewState } from './chunk-progress';
import {
  buildGradeChunkReviewResult,
  persistGradeSideEffects,
  type GradeChunkReviewResult,
  type ReviewPersistenceClient,
} from './review-grade';
import {
  findReviewableChunkForCard,
  getCurrentReviewChunkCard,
  resolveNextActionableItemAfterGrade,
} from './review-grade-flow';
import { getReviewGradeSchedule } from './review-grade-schedule';
import {
  resolveReviewKindSupport,
  REVIEW_KIND_UNSUPPORTED_REASONS,
} from './review-kind-adapter';
import {
  emitReviewGradedObservability,
  emitReviewUnsupportedObservability,
} from './review-service-observability';
import { applyGradeToStandaloneCard } from './standalone-card-review';

interface ApplyGradeToReviewCardInput {
  cardId: string;
  deckId?: string;
  grade: Grade;
  logger: Logger;
  now: Date;
  prisma: PrismaService;
  reviewLogMode?: string;
  skipKindSupportCheck?: boolean;
  userId: string;
}

export async function applyGradeToReviewCard({
  cardId,
  deckId,
  grade,
  logger,
  now,
  prisma,
  reviewLogMode,
  skipKindSupportCheck = false,
  userId,
}: ApplyGradeToReviewCardInput): Promise<GradeChunkReviewResult | null> {
  const startedAtMs = Date.now();
  const reviewable = await findReviewableChunkForCard(
    prisma,
    cardId,
    userId,
    now,
    deckId,
  );

  if (!reviewable) {
    return applyGradeToStandaloneCard({
      cardId,
      deckId,
      grade,
      now,
      prisma,
      reviewLogMode,
      userId,
    });
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

  if (!skipKindSupportCheck && !reviewKindSupport.isReviewSupported) {
    emitReviewUnsupportedObservability({
      logger,
      userId,
      source: 'grade_attempt',
      reason:
        reviewKindSupport.reviewUnsupportedReason ??
        REVIEW_KIND_UNSUPPORTED_REASONS.kindNotReviewEnabled,
      cardId,
      kind: currentCard.kind,
      generatedAt: now,
    });
    return null;
  }
  const reviewIntervalHours = resolveChunkReviewIntervalHours(
    chunk.deck?.reviewIntervalHours,
  );
  const schedule = getReviewGradeSchedule({
    grade,
    now,
    reviewIntervalHours,
    snapshot,
  });
  const existingCardState = await prisma.reviewState.findUnique({
    where: { cardId },
    select: {
      ease: true,
      interval: true,
      reps: true,
      lapses: true,
      consecutiveSuccessCount: true,
    },
  });

  await prisma.$transaction(async (tx) => {
    await persistGradeSideEffects(tx as ReviewPersistenceClient, {
      cardId,
      chunkId: chunk.id,
      now,
      nextDue: schedule.nextDue,
      nextConsecutiveSuccessCount: schedule.nextConsecutiveSuccessCount,
      grade,
      intervalHours: schedule.intervalHours,
      wasSuccessful: schedule.wasSuccessful,
      existingCardState,
      mode: reviewLogMode ?? currentCard.kind,
    });
  });

  const nextSnapshot = deriveChunkReviewState(chunk, now, {
    ...state,
    due: schedule.nextDue,
    consecutiveSuccessCount: schedule.nextConsecutiveSuccessCount,
    lastGrade: grade,
    updatedAt: now,
  });
  const nextActionableItem = await resolveNextActionableItemAfterGrade(prisma, {
    cardId,
    chunk,
    isImmediateRetry: schedule.isImmediateRetry,
    nextSnapshot,
    now,
    userId,
    deckId,
  });

  emitReviewGradedObservability({
    logger,
    userId,
    cardId,
    kind: currentCard.kind,
    grade,
    latencyMs: Date.now() - startedAtMs,
    generatedAt: now,
  });

  return buildGradeChunkReviewResult({
    cardId,
    grade,
    wasSuccessful: schedule.wasSuccessful,
    snapshot,
    nextConsecutiveSuccessCount: schedule.nextConsecutiveSuccessCount,
    nextDue: schedule.nextDue,
    intervalHours: schedule.intervalHours,
    nextActionableItem,
  });
}

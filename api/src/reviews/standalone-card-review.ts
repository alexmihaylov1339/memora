import type { PrismaService } from '../../prisma/prisma.service';
import { resolveChunkReviewIntervalHours } from './chunk-scheduling';
import {
  buildGradeChunkReviewResult,
  type GradeChunkReviewResult,
} from './review-grade';
import { getReviewGradeSchedule } from './review-grade-schedule';
import { findReviewableStandaloneCard } from './standalone-card-review-access';
import {
  buildStandaloneSnapshot,
  resolveNextStandaloneActionableItem,
} from './standalone-card-review-mapping';
import {
  createMissingStandaloneReviewState,
  initStandaloneCardReviewState,
  persistStandaloneGradeSideEffects,
} from './standalone-card-review-state';
import type { ApplyGradeToStandaloneCardInput } from './standalone-card-review-types';

export { initStandaloneCardReviewState };

export async function applyGradeToStandaloneCard({
  cardId,
  deckId,
  grade,
  now,
  prisma,
  reviewLogMode,
  userId,
}: ApplyGradeToStandaloneCardInput): Promise<GradeChunkReviewResult | null> {
  const card = await findReviewableStandaloneCard(
    prisma as PrismaService,
    cardId,
    userId,
    deckId,
  );

  if (!card?.deckId) {
    return null;
  }

  const state =
    card.state ??
    (await createMissingStandaloneReviewState(
      prisma as PrismaService,
      card.id,
      now,
    ));
  const snapshot = buildStandaloneSnapshot(card, state, now);
  const schedule = getReviewGradeSchedule({
    grade,
    now,
    reviewIntervalHours: resolveChunkReviewIntervalHours(
      card.deck?.reviewIntervalHours,
    ),
    snapshot,
  });

  await prisma.$transaction(async (tx) => {
    await persistStandaloneGradeSideEffects(tx, {
      card,
      grade,
      intervalHours: schedule.intervalHours,
      nextConsecutiveSuccessCount: schedule.nextConsecutiveSuccessCount,
      nextDue: schedule.nextDue,
      now,
      reviewLogMode,
      state,
      wasSuccessful: schedule.wasSuccessful,
    });
  });

  const nextActionableItem = await resolveNextStandaloneActionableItem(
    prisma as PrismaService,
    {
      cardId,
      deckId,
      isImmediateRetry: schedule.isImmediateRetry,
      now,
      userId,
    },
  );

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

import type { PrismaService } from '../../prisma/prisma.service';
import { DEFAULT_REVIEW_EASE } from './review-grade';
import type {
  StandaloneGradePersistenceInput,
  StandaloneReviewState,
} from './standalone-card-review-types';

type StandaloneReviewPersistenceClient = Pick<
  PrismaService,
  'reviewLog' | 'reviewState'
>;

export async function initStandaloneCardReviewState(
  prisma: Pick<PrismaService, 'reviewState'>,
  cardIds: string[],
  now = new Date(),
): Promise<void> {
  if (cardIds.length === 0) {
    return;
  }

  await prisma.reviewState.createMany({
    data: cardIds.map((cardId) => ({
      cardId,
      ease: DEFAULT_REVIEW_EASE,
      interval: 0,
      due: now,
      reps: 0,
      lapses: 0,
      consecutiveSuccessCount: 0,
      lastGrade: null,
    })),
    skipDuplicates: true,
  });
}

export async function createMissingStandaloneReviewState(
  prisma: PrismaService,
  cardId: string,
  now: Date,
): Promise<StandaloneReviewState> {
  return prisma.reviewState.create({
    data: {
      cardId,
      ease: DEFAULT_REVIEW_EASE,
      interval: 0,
      due: now,
      reps: 0,
      lapses: 0,
      consecutiveSuccessCount: 0,
      lastGrade: null,
    },
    select: {
      due: true,
      ease: true,
      interval: true,
      reps: true,
      lapses: true,
      consecutiveSuccessCount: true,
      lastGrade: true,
    },
  });
}

export async function persistStandaloneGradeSideEffects(
  client: StandaloneReviewPersistenceClient,
  input: StandaloneGradePersistenceInput,
): Promise<void> {
  await client.reviewState.update({
    where: { cardId: input.card.id },
    data: {
      due: input.nextDue,
      interval: input.intervalHours,
      reps: input.wasSuccessful ? input.state.reps + 1 : input.state.reps,
      lapses: input.wasSuccessful ? input.state.lapses : input.state.lapses + 1,
      consecutiveSuccessCount: input.nextConsecutiveSuccessCount,
      lastGrade: input.grade,
    },
  });

  await client.reviewLog.create({
    data: {
      cardId: input.card.id,
      reviewedAt: input.now,
      grade: input.grade,
      oldInterval: input.state.interval,
      newInterval: input.intervalHours,
      oldEase: input.state.ease,
      newEase: input.state.ease,
      mode: input.card.kind,
      wasCorrect: input.wasSuccessful,
    },
  });
}

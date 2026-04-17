import type { Grade } from '@prisma/client';
import type { PrismaService } from '../../prisma/prisma.service';
import type {
  ChunkProgressSnapshot,
  ChunkWithCards,
  PersistedChunkReviewState,
} from './chunk-progress';
import type { ReviewQueueItem } from './review-queue';

export const DEFAULT_REVIEW_EASE = 2.5;

export type ReviewPersistenceClient = Pick<
  PrismaService,
  'chunkReviewState' | 'reviewLog' | 'reviewState'
>;

export type GradeSideEffectsInput = {
  cardId: string;
  chunkId: string;
  now: Date;
  nextDue: Date;
  nextConsecutiveSuccessCount: number;
  grade: Grade;
  intervalHours: number;
  wasSuccessful: boolean;
  existingCardState: {
    ease: number;
    interval: number;
    reps: number;
    lapses: number;
  } | null;
  mode: string;
};

export type GradeChunkReviewResult = {
  cardId: string;
  grade: Grade;
  wasSuccessful: boolean;
  advanced: boolean;
  reset: boolean;
  previousConsecutiveSuccessCount: number;
  consecutiveSuccessCount: number;
  due: Date;
  intervalHours: number;
  chunk: ChunkProgressSnapshot;
  nextActionableItem: ReviewQueueItem | null;
};

export async function ensureChunkReviewState(
  prisma: PrismaService,
  chunkId: string,
  now: Date,
): Promise<PersistedChunkReviewState> {
  return (await prisma.chunkReviewState.upsert({
    where: { chunkId },
    update: {},
    create: {
      chunkId,
      due: now,
      consecutiveSuccessCount: 0,
    },
  })) as PersistedChunkReviewState;
}

export async function persistGradeSideEffects(
  client: ReviewPersistenceClient,
  input: GradeSideEffectsInput,
): Promise<void> {
  await client.chunkReviewState.update({
    where: { chunkId: input.chunkId },
    data: {
      due: input.nextDue,
      consecutiveSuccessCount: input.nextConsecutiveSuccessCount,
      lastGrade: input.grade,
    },
  });

  await client.reviewState.upsert({
    where: { cardId: input.cardId },
    update: {
      due: input.nextDue,
      interval: input.intervalHours,
      reps: input.wasSuccessful
        ? input.existingCardState
          ? input.existingCardState.reps + 1
          : 1
        : (input.existingCardState?.reps ?? 0),
      lapses: input.wasSuccessful
        ? (input.existingCardState?.lapses ?? 0)
        : (input.existingCardState?.lapses ?? 0) + 1,
      lastGrade: input.grade,
    },
    create: {
      cardId: input.cardId,
      ease: DEFAULT_REVIEW_EASE,
      interval: input.intervalHours,
      due: input.nextDue,
      reps: input.wasSuccessful ? 1 : 0,
      lapses: input.wasSuccessful ? 0 : 1,
      lastGrade: input.grade,
    },
  });

  await client.reviewLog.create({
    data: {
      cardId: input.cardId,
      reviewedAt: input.now,
      grade: input.grade,
      oldInterval: input.existingCardState?.interval ?? 0,
      newInterval: input.intervalHours,
      oldEase: input.existingCardState?.ease ?? DEFAULT_REVIEW_EASE,
      newEase: input.existingCardState?.ease ?? DEFAULT_REVIEW_EASE,
      mode: input.mode,
      wasCorrect: input.wasSuccessful,
    },
  });
}

export function buildNextActionableItem(
  chunk: ChunkWithCards,
  snapshot: ChunkProgressSnapshot,
): ReviewQueueItem | null {
  const nextChunkCard =
    snapshot.currentCard === null
      ? null
      : chunk.chunkCards[snapshot.currentCard.sequenceIndex];

  if (
    snapshot.hasMastery ||
    snapshot.currentCard === null ||
    !nextChunkCard?.card
  ) {
    return null;
  }

  return {
    cardId: nextChunkCard.card.id,
    deckId: chunk.deckId,
    chunkId: chunk.id,
    chunkTitle: chunk.title,
    chunkPosition: chunk.position,
    positionInChunk: snapshot.currentCard.sequenceIndex,
    due: snapshot.due,
    kind: nextChunkCard.card.kind,
    fields: nextChunkCard.card.fields,
    cardCreatedAt: nextChunkCard.card.createdAt,
    consecutiveSuccessCount: snapshot.consecutiveSuccessCount,
  };
}

export function buildGradeChunkReviewResult(input: {
  cardId: string;
  grade: Grade;
  wasSuccessful: boolean;
  snapshot: ChunkProgressSnapshot;
  nextConsecutiveSuccessCount: number;
  nextDue: Date;
  intervalHours: number;
  nextActionableItem: ReviewQueueItem | null;
}): GradeChunkReviewResult {
  return {
    cardId: input.cardId,
    grade: input.grade,
    wasSuccessful: input.wasSuccessful,
    advanced: input.wasSuccessful,
    reset: !input.wasSuccessful,
    previousConsecutiveSuccessCount: input.snapshot.consecutiveSuccessCount,
    consecutiveSuccessCount: input.nextConsecutiveSuccessCount,
    due: input.nextDue,
    intervalHours: input.intervalHours,
    chunk: input.snapshot,
    nextActionableItem: input.nextActionableItem,
  };
}

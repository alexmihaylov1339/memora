import type { Grade } from '@prisma/client';
import {
  computeNextDueAt,
  getChunkReviewIntervalHours,
  getNextConsecutiveSuccessCount,
} from './chunk-scheduling';
import type { ChunkProgressSnapshot } from './chunk-progress';

interface ReviewGradeScheduleInput {
  grade: Grade;
  now: Date;
  reviewIntervalHours: number[];
  snapshot: ChunkProgressSnapshot;
}

export interface ReviewGradeSchedule {
  intervalHours: number;
  isImmediateRetry: boolean;
  nextConsecutiveSuccessCount: number;
  nextDue: Date;
  wasSuccessful: boolean;
}

export function getReviewGradeSchedule({
  grade,
  now,
  reviewIntervalHours,
  snapshot,
}: ReviewGradeScheduleInput): ReviewGradeSchedule {
  const isImmediateRetry = grade === 'again';
  const wasSuccessful = grade === 'good' || grade === 'easy';

  const goodBaseSuccessCount = getNextConsecutiveSuccessCount(
    snapshot.consecutiveSuccessCount,
    true,
  );
  const goodBaseIntervalHours = getChunkReviewIntervalHours(
    goodBaseSuccessCount,
    reviewIntervalHours,
  );

  const nextConsecutiveSuccessCount = isImmediateRetry
    ? getNextImmediateRetryPosition(snapshot)
    : wasSuccessful
      ? goodBaseSuccessCount
      : 0;

  let intervalHours: number;
  if (isImmediateRetry) {
    intervalHours = 0;
  } else if (grade === 'hard') {
    intervalHours = Math.max(1, Math.round(goodBaseIntervalHours * 0.5));
  } else if (grade === 'easy') {
    intervalHours = Math.round(goodBaseIntervalHours * 1.5);
  } else {
    intervalHours = goodBaseIntervalHours;
  }

  return {
    intervalHours,
    isImmediateRetry,
    nextConsecutiveSuccessCount,
    nextDue: computeNextDueAt(now, intervalHours),
    wasSuccessful,
  };
}

function getNextImmediateRetryPosition(
  snapshot: ChunkProgressSnapshot,
): number {
  if (snapshot.totalCards <= 0) {
    return 0;
  }

  return (snapshot.consecutiveSuccessCount + 1) % snapshot.totalCards;
}

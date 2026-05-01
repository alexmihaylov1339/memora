import type { Grade } from '@prisma/client';
import {
  computeNextDueAt,
  getChunkReviewIntervalHours,
  getNextConsecutiveSuccessCount,
} from './chunk-scheduling';
import type { ChunkProgressSnapshot } from './chunk-progress';
import { getNextImmediateRetryPosition } from './review-grade-flow';

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
    : getChunkReviewIntervalHours(
        nextConsecutiveSuccessCount,
        reviewIntervalHours,
      );

  return {
    intervalHours,
    isImmediateRetry,
    nextConsecutiveSuccessCount,
    nextDue: computeNextDueAt(now, intervalHours),
    wasSuccessful,
  };
}

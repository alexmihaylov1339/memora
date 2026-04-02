const MS_PER_HOUR = 60 * 60 * 1000;

export const DEFAULT_CHUNK_REVIEW_INTERVAL_HOURS = [
  4, 8, 12, 24, 48, 72, 120, 192, 288, 480, 720, 1440, 2160, 2880, 4320, 5760,
  8760, 12960, 17520, 26280,
] as const;

export const DEFAULT_CHUNK_REQUIRED_CONSECUTIVE_SUCCESSES =
  DEFAULT_CHUNK_REVIEW_INTERVAL_HOURS.length;

export function getCurrentChunkCardIndex(
  consecutiveSuccessCount: number,
  totalCards: number,
): number {
  if (
    !Number.isInteger(consecutiveSuccessCount) ||
    consecutiveSuccessCount < 0
  ) {
    throw new Error('consecutiveSuccessCount must be a non-negative integer');
  }

  if (!Number.isInteger(totalCards) || totalCards <= 0) {
    throw new Error('totalCards must be a positive integer');
  }

  return consecutiveSuccessCount % totalCards;
}

export function getNextConsecutiveSuccessCount(
  currentConsecutiveSuccessCount: number,
  wasSuccessful: boolean,
): number {
  if (
    !Number.isInteger(currentConsecutiveSuccessCount) ||
    currentConsecutiveSuccessCount < 0
  ) {
    throw new Error(
      'currentConsecutiveSuccessCount must be a non-negative integer',
    );
  }

  return wasSuccessful ? currentConsecutiveSuccessCount + 1 : 0;
}

export function hasChunkMastery(
  consecutiveSuccessCount: number,
  requiredConsecutiveSuccesses = DEFAULT_CHUNK_REQUIRED_CONSECUTIVE_SUCCESSES,
): boolean {
  if (
    !Number.isInteger(consecutiveSuccessCount) ||
    consecutiveSuccessCount < 0
  ) {
    throw new Error('consecutiveSuccessCount must be a non-negative integer');
  }

  if (
    !Number.isInteger(requiredConsecutiveSuccesses) ||
    requiredConsecutiveSuccesses <= 0
  ) {
    throw new Error('requiredConsecutiveSuccesses must be a positive integer');
  }

  return consecutiveSuccessCount >= requiredConsecutiveSuccesses;
}

export function getChunkReviewIntervalHours(
  consecutiveSuccessCount: number,
  reviewIntervalHours: readonly number[] = DEFAULT_CHUNK_REVIEW_INTERVAL_HOURS,
): number {
  if (
    !Number.isInteger(consecutiveSuccessCount) ||
    consecutiveSuccessCount < 0
  ) {
    throw new Error('consecutiveSuccessCount must be a non-negative integer');
  }

  if (reviewIntervalHours.length === 0) {
    throw new Error('reviewIntervalHours must contain at least one interval');
  }

  for (const intervalHours of reviewIntervalHours) {
    if (!Number.isInteger(intervalHours) || intervalHours < 0) {
      throw new Error('reviewIntervalHours must contain non-negative integers');
    }
  }

  const intervalIndex = Math.min(
    consecutiveSuccessCount,
    reviewIntervalHours.length - 1,
  );

  return reviewIntervalHours[intervalIndex];
}

export function computeNextDueAt(
  baseTime: Date,
  intervalHours = DEFAULT_CHUNK_REVIEW_INTERVAL_HOURS[0],
): Date {
  if (!(baseTime instanceof Date) || Number.isNaN(baseTime.getTime())) {
    throw new Error('baseTime must be a valid Date');
  }

  if (!Number.isInteger(intervalHours) || intervalHours < 0) {
    throw new Error('intervalHours must be a non-negative integer');
  }

  return new Date(baseTime.getTime() + intervalHours * MS_PER_HOUR);
}

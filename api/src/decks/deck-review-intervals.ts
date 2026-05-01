import { BadRequestException } from '@nestjs/common';
import { DEFAULT_CHUNK_REVIEW_INTERVAL_HOURS } from '../reviews/chunk-scheduling';
import { DECK_ERROR_MESSAGES } from './deck-errors';

const MAX_DECK_REVIEW_INTERVALS = 30;

export function getDefaultDeckReviewIntervalHours(): number[] {
  return [...DEFAULT_CHUNK_REVIEW_INTERVAL_HOURS];
}

export function normalizeDeckReviewIntervalHours(
  value: unknown,
): number[] | undefined {
  if (value === undefined) {
    return undefined;
  }

  if (
    !Array.isArray(value) ||
    value.length === 0 ||
    value.length > MAX_DECK_REVIEW_INTERVALS
  ) {
    throw new BadRequestException(
      DECK_ERROR_MESSAGES.reviewIntervalHoursInvalid,
    );
  }

  const intervals = value.map((item) => Number(item));
  if (
    intervals.some(
      (intervalHours) => !Number.isInteger(intervalHours) || intervalHours <= 0,
    )
  ) {
    throw new BadRequestException(
      DECK_ERROR_MESSAGES.reviewIntervalHoursInvalid,
    );
  }

  return intervals;
}

export function resolveDeckReviewIntervalHours(value: unknown): number[] {
  try {
    return (
      normalizeDeckReviewIntervalHours(value) ??
      getDefaultDeckReviewIntervalHours()
    );
  } catch {
    return getDefaultDeckReviewIntervalHours();
  }
}

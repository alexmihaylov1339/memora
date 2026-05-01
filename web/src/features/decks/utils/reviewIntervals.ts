import { CHUNK_REVIEW_PREVIEW_HOURS } from '@features/chunks/constants/reviewSchedule';

const HOURS_PER_DAY = 24;
const HOURS_PER_WEEK = HOURS_PER_DAY * 7;
const INTERVAL_PATTERN = /^(\d+)\s*(h|hr|hrs|hour|hours|d|day|days|w|week|weeks)?$/i;

export function getDefaultDeckReviewIntervalHours(): number[] {
  return [...CHUNK_REVIEW_PREVIEW_HOURS];
}

export function formatReviewIntervalHours(intervalHours: number): string {
  if (intervalHours % HOURS_PER_WEEK === 0) {
    return `${intervalHours / HOURS_PER_WEEK}w`;
  }

  if (intervalHours % HOURS_PER_DAY === 0) {
    return `${intervalHours / HOURS_PER_DAY}d`;
  }

  return `${intervalHours}h`;
}

export function formatDeckReviewIntervalsInput(
  intervalHours: readonly number[] = getDefaultDeckReviewIntervalHours(),
): string {
  return intervalHours.map(formatReviewIntervalHours).join(', ');
}

export function parseDeckReviewIntervalsInput(value: string): number[] {
  const intervals = value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
    .map(parseReviewIntervalToken);

  if (intervals.length === 0) {
    throw new Error('Add at least one review interval.');
  }

  return intervals;
}

function parseReviewIntervalToken(token: string): number {
  const match = token.match(INTERVAL_PATTERN);
  if (!match) {
    throw new Error('Use intervals like 4h, 1d, or 2w.');
  }

  const amount = Number(match[1]);
  const unit = match[2]?.toLowerCase() ?? 'h';
  if (!Number.isInteger(amount) || amount <= 0) {
    throw new Error('Review intervals must be positive whole numbers.');
  }

  if (unit.startsWith('w')) {
    return amount * HOURS_PER_WEEK;
  }

  if (unit.startsWith('d')) {
    return amount * HOURS_PER_DAY;
  }

  return amount;
}

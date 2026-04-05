const HOURS_PER_DAY = 24;
const HOURS_PER_WEEK = HOURS_PER_DAY * 7;
const MIN_SELECTED_CARDS = 1;

export const CHUNK_REVIEW_PREVIEW_HOURS = [
  4, 8, 12, 24, 48, 72, 120, 192, 288, 480, 720, 1440, 2160, 2880, 4320, 5760,
  8760, 12960, 17520, 26280,
] as const;

export const CHUNK_MASTERY_TARGET = CHUNK_REVIEW_PREVIEW_HOURS.length;
export const MIN_CHUNK_CARD_SELECTION = MIN_SELECTED_CARDS;

export function formatChunkScheduleInterval(hours: number): string {
  if (hours < HOURS_PER_DAY) {
    return `${hours}h`;
  }

  if (hours % HOURS_PER_WEEK === 0) {
    return `${hours / HOURS_PER_WEEK}w`;
  }

  return `${hours / HOURS_PER_DAY}d`;
}

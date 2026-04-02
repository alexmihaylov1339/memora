import {
  computeNextDueAt,
  DEFAULT_CHUNK_REQUIRED_CONSECUTIVE_SUCCESSES,
  DEFAULT_CHUNK_REVIEW_INTERVAL_HOURS,
  getCurrentChunkCardIndex,
  getChunkReviewIntervalHours,
  getNextConsecutiveSuccessCount,
  hasChunkMastery,
} from './chunk-scheduling';

describe('chunk-scheduling', () => {
  describe('defaults', () => {
    it('uses a 20-success streak mastery target and a long default interval sequence', () => {
      expect(DEFAULT_CHUNK_REQUIRED_CONSECUTIVE_SUCCESSES).toBe(20);
      expect(DEFAULT_CHUNK_REVIEW_INTERVAL_HOURS).toEqual([
        4, 8, 12, 24, 48, 72, 120, 192, 288, 480, 720, 1440, 2160, 2880, 4320,
        5760, 8760, 12960, 17520, 26280,
      ]);
    });
  });

  describe('getCurrentChunkCardIndex', () => {
    it('shows exactly one next card and wraps through the chunk', () => {
      expect(getCurrentChunkCardIndex(0, 5)).toBe(0);
      expect(getCurrentChunkCardIndex(1, 5)).toBe(1);
      expect(getCurrentChunkCardIndex(2, 5)).toBe(2);
      expect(getCurrentChunkCardIndex(4, 5)).toBe(4);
      expect(getCurrentChunkCardIndex(5, 5)).toBe(0);
      expect(getCurrentChunkCardIndex(6, 5)).toBe(1);
      expect(getCurrentChunkCardIndex(19, 5)).toBe(4);
    });

    it('throws for invalid counts or chunk sizes', () => {
      expect(() => getCurrentChunkCardIndex(-1, 5)).toThrow(
        'consecutiveSuccessCount must be a non-negative integer',
      );
      expect(() => getCurrentChunkCardIndex(0, 0)).toThrow(
        'totalCards must be a positive integer',
      );
    });
  });

  describe('getNextConsecutiveSuccessCount', () => {
    it('advances by one on success', () => {
      expect(getNextConsecutiveSuccessCount(0, true)).toBe(1);
      expect(getNextConsecutiveSuccessCount(7, true)).toBe(8);
    });

    it('resets to zero on failure', () => {
      expect(getNextConsecutiveSuccessCount(1, false)).toBe(0);
      expect(getNextConsecutiveSuccessCount(19, false)).toBe(0);
    });

    it('throws for invalid current counts', () => {
      expect(() => getNextConsecutiveSuccessCount(-1, true)).toThrow(
        'currentConsecutiveSuccessCount must be a non-negative integer',
      );
    });
  });

  describe('hasChunkMastery', () => {
    it('requires 20 consecutive successes by default', () => {
      expect(hasChunkMastery(19)).toBe(false);
      expect(hasChunkMastery(20)).toBe(true);
      expect(hasChunkMastery(21)).toBe(true);
    });

    it('supports overriding the required streak', () => {
      expect(hasChunkMastery(4, 5)).toBe(false);
      expect(hasChunkMastery(5, 5)).toBe(true);
    });

    it('throws for invalid values', () => {
      expect(() => hasChunkMastery(-1)).toThrow(
        'consecutiveSuccessCount must be a non-negative integer',
      );
      expect(() => hasChunkMastery(1, 0)).toThrow(
        'requiredConsecutiveSuccesses must be a positive integer',
      );
    });
  });

  describe('getChunkReviewIntervalHours', () => {
    it('returns the configured interval for each success step', () => {
      expect(getChunkReviewIntervalHours(0)).toBe(4);
      expect(getChunkReviewIntervalHours(1)).toBe(8);
      expect(getChunkReviewIntervalHours(2)).toBe(12);
      expect(getChunkReviewIntervalHours(3)).toBe(24);
      expect(getChunkReviewIntervalHours(11)).toBe(1440);
    });

    it('caps at the last configured interval after the default sequence ends', () => {
      expect(getChunkReviewIntervalHours(19)).toBe(26280);
      expect(getChunkReviewIntervalHours(20)).toBe(26280);
      expect(getChunkReviewIntervalHours(99)).toBe(26280);
    });

    it('supports custom schedules for future user-configurable decks', () => {
      expect(getChunkReviewIntervalHours(0, [2, 6, 10])).toBe(2);
      expect(getChunkReviewIntervalHours(1, [2, 6, 10])).toBe(6);
      expect(getChunkReviewIntervalHours(5, [2, 6, 10])).toBe(10);
    });

    it('throws for invalid counts or schedules', () => {
      expect(() => getChunkReviewIntervalHours(-1)).toThrow(
        'consecutiveSuccessCount must be a non-negative integer',
      );
      expect(() => getChunkReviewIntervalHours(0, [])).toThrow(
        'reviewIntervalHours must contain at least one interval',
      );
      expect(() => getChunkReviewIntervalHours(0, [4, -1])).toThrow(
        'reviewIntervalHours must contain non-negative integers',
      );
    });
  });

  describe('computeNextDueAt', () => {
    it('uses the first default review interval for MVP', () => {
      const baseTime = new Date('2026-04-01T10:30:00.000Z');

      expect(computeNextDueAt(baseTime).toISOString()).toBe(
        '2026-04-01T14:30:00.000Z',
      );
    });

    it('adds UTC-safe hour intervals based on exact timestamps', () => {
      const baseTime = new Date('2026-04-01T10:30:00.000Z');

      expect(computeNextDueAt(baseTime, 0).toISOString()).toBe(
        '2026-04-01T10:30:00.000Z',
      );
      expect(computeNextDueAt(baseTime, 12).toISOString()).toBe(
        '2026-04-01T22:30:00.000Z',
      );
    });

    it('throws for invalid dates or intervals', () => {
      expect(() => computeNextDueAt(new Date('invalid'), 1)).toThrow(
        'baseTime must be a valid Date',
      );
      expect(() => computeNextDueAt(new Date(), -1)).toThrow(
        'intervalHours must be a non-negative integer',
      );
    });
  });
});

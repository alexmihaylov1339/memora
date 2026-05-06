import { DEFAULT_CHUNK_REVIEW_INTERVAL_HOURS } from './chunk-scheduling';
import { getReviewGradeSchedule } from './review-grade-schedule';
import type { ChunkProgressSnapshot } from './chunk-progress';

function buildSnapshot(
  overrides: Partial<ChunkProgressSnapshot> = {},
): ChunkProgressSnapshot {
  return {
    chunkId: 'chunk-1',
    deckId: 'deck-1',
    title: 'test',
    position: 0,
    due: new Date('2026-04-02T08:00:00.000Z'),
    isDue: true,
    consecutiveSuccessCount: 0,
    requiredConsecutiveSuccesses: 20,
    hasMastery: false,
    totalCards: 3,
    currentCard: { cardId: 'card-1', sequenceIndex: 0 },
    lastGrade: null,
    ...overrides,
  };
}

const now = new Date('2026-04-02T09:00:00.000Z');
const intervals = [...DEFAULT_CHUNK_REVIEW_INTERVAL_HOURS];

describe('getReviewGradeSchedule', () => {
  describe('again', () => {
    it('is an immediate retry with zero interval', () => {
      const result = getReviewGradeSchedule({
        grade: 'again',
        now,
        reviewIntervalHours: intervals,
        snapshot: buildSnapshot({ consecutiveSuccessCount: 5 }),
      });

      expect(result.isImmediateRetry).toBe(true);
      expect(result.wasSuccessful).toBe(false);
      expect(result.intervalHours).toBe(0);
      expect(result.nextDue).toEqual(now);
    });

    it('cycles the success count through the chunk cards', () => {
      const result = getReviewGradeSchedule({
        grade: 'again',
        now,
        reviewIntervalHours: intervals,
        snapshot: buildSnapshot({ consecutiveSuccessCount: 2, totalCards: 3 }),
      });

      // getNextImmediateRetryPosition: (2+1) % 3 = 0
      expect(result.nextConsecutiveSuccessCount).toBe(0);
    });
  });

  describe('hard', () => {
    it('is not an immediate retry', () => {
      const result = getReviewGradeSchedule({
        grade: 'hard',
        now,
        reviewIntervalHours: intervals,
        snapshot: buildSnapshot({ consecutiveSuccessCount: 0 }),
      });

      expect(result.isImmediateRetry).toBe(false);
      expect(result.wasSuccessful).toBe(false);
    });

    it('resets consecutive success count to zero', () => {
      const result = getReviewGradeSchedule({
        grade: 'hard',
        now,
        reviewIntervalHours: intervals,
        snapshot: buildSnapshot({ consecutiveSuccessCount: 5 }),
      });

      expect(result.nextConsecutiveSuccessCount).toBe(0);
    });

    it('gives half the interval good would give (rounded)', () => {
      // consecutiveSuccessCount=0 → goodBase = intervals[1] = 8h → hard = 4h
      const result = getReviewGradeSchedule({
        grade: 'hard',
        now,
        reviewIntervalHours: intervals,
        snapshot: buildSnapshot({ consecutiveSuccessCount: 0 }),
      });

      expect(result.intervalHours).toBe(4);
      expect(result.nextDue).toEqual(new Date('2026-04-02T13:00:00.000Z'));
    });

    it('gives half the interval at a higher success count', () => {
      // consecutiveSuccessCount=2 → goodBase = intervals[3] = 24h → hard = 12h
      const result = getReviewGradeSchedule({
        grade: 'hard',
        now,
        reviewIntervalHours: intervals,
        snapshot: buildSnapshot({ consecutiveSuccessCount: 2 }),
      });

      expect(result.intervalHours).toBe(12);
    });

    it('enforces a minimum of 1 hour', () => {
      const result = getReviewGradeSchedule({
        grade: 'hard',
        now,
        reviewIntervalHours: [1, 1],
        snapshot: buildSnapshot({ consecutiveSuccessCount: 0 }),
      });

      // goodBase = 1h → 0.5 rounds to 1, Math.max(1, 1) = 1
      expect(result.intervalHours).toBe(1);
    });
  });

  describe('good', () => {
    it('is a success and increments the consecutive success count', () => {
      const result = getReviewGradeSchedule({
        grade: 'good',
        now,
        reviewIntervalHours: intervals,
        snapshot: buildSnapshot({ consecutiveSuccessCount: 0 }),
      });

      expect(result.isImmediateRetry).toBe(false);
      expect(result.wasSuccessful).toBe(true);
      expect(result.nextConsecutiveSuccessCount).toBe(1);
    });

    it('uses the base good interval without multiplier', () => {
      // consecutiveSuccessCount=0 → goodBase = intervals[1] = 8h
      const result = getReviewGradeSchedule({
        grade: 'good',
        now,
        reviewIntervalHours: intervals,
        snapshot: buildSnapshot({ consecutiveSuccessCount: 0 }),
      });

      expect(result.intervalHours).toBe(8);
      expect(result.nextDue).toEqual(new Date('2026-04-02T17:00:00.000Z'));
    });
  });

  describe('easy', () => {
    it('is a success and increments the consecutive success count', () => {
      const result = getReviewGradeSchedule({
        grade: 'easy',
        now,
        reviewIntervalHours: intervals,
        snapshot: buildSnapshot({ consecutiveSuccessCount: 0 }),
      });

      expect(result.isImmediateRetry).toBe(false);
      expect(result.wasSuccessful).toBe(true);
      expect(result.nextConsecutiveSuccessCount).toBe(1);
    });

    it('gives 1.5x the interval good would give (rounded)', () => {
      // consecutiveSuccessCount=0 → goodBase = intervals[1] = 8h → easy = 12h
      const result = getReviewGradeSchedule({
        grade: 'easy',
        now,
        reviewIntervalHours: intervals,
        snapshot: buildSnapshot({ consecutiveSuccessCount: 0 }),
      });

      expect(result.intervalHours).toBe(12);
      expect(result.nextDue).toEqual(new Date('2026-04-02T21:00:00.000Z'));
    });

    it('gives 1.5x the interval at a higher success count', () => {
      // consecutiveSuccessCount=2 → goodBase = intervals[3] = 24h → easy = 36h
      const result = getReviewGradeSchedule({
        grade: 'easy',
        now,
        reviewIntervalHours: intervals,
        snapshot: buildSnapshot({ consecutiveSuccessCount: 2 }),
      });

      expect(result.intervalHours).toBe(36);
    });
  });

  describe('interval ordering', () => {
    it('always produces hard < good < easy for the same snapshot', () => {
      const snapshot = buildSnapshot({ consecutiveSuccessCount: 0 });
      const hard = getReviewGradeSchedule({ grade: 'hard', now, reviewIntervalHours: intervals, snapshot });
      const good = getReviewGradeSchedule({ grade: 'good', now, reviewIntervalHours: intervals, snapshot });
      const easy = getReviewGradeSchedule({ grade: 'easy', now, reviewIntervalHours: intervals, snapshot });

      expect(hard.intervalHours).toBeLessThan(good.intervalHours);
      expect(good.intervalHours).toBeLessThan(easy.intervalHours);
    });

    it('again has a shorter interval than hard', () => {
      const snapshot = buildSnapshot({ consecutiveSuccessCount: 0 });
      const again = getReviewGradeSchedule({ grade: 'again', now, reviewIntervalHours: intervals, snapshot });
      const hard = getReviewGradeSchedule({ grade: 'hard', now, reviewIntervalHours: intervals, snapshot });

      expect(again.intervalHours).toBeLessThan(hard.intervalHours);
    });
  });
});

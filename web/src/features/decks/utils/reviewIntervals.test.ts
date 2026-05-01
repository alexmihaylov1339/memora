import {
  formatDeckReviewIntervalsInput,
  parseDeckReviewIntervalsInput,
} from './reviewIntervals';

describe('reviewIntervals', () => {
  it('formats whole hour intervals with friendly units', () => {
    expect(formatDeckReviewIntervalsInput([4, 24, 168])).toBe('4h, 1d, 1w');
  });

  it('parses friendly hour, day, and week intervals', () => {
    expect(parseDeckReviewIntervalsInput('4h, 1 day, 2w')).toEqual([
      4, 24, 336,
    ]);
  });

  it('rejects empty interval input', () => {
    expect(() => parseDeckReviewIntervalsInput(' , ')).toThrow(
      'Add at least one review interval.',
    );
  });
});

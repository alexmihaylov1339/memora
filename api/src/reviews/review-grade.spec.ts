import { DEFAULT_REVIEW_EASE, persistGradeSideEffects } from './review-grade';

type PersistenceClientMock = {
  chunkReviewState: { update: jest.Mock };
  reviewState: { upsert: jest.Mock };
  reviewLog: { create: jest.Mock };
};

function createPersistenceClientMock(): PersistenceClientMock {
  return {
    chunkReviewState: { update: jest.fn().mockResolvedValue(undefined) },
    reviewState: { upsert: jest.fn().mockResolvedValue(undefined) },
    reviewLog: { create: jest.fn().mockResolvedValue(undefined) },
  };
}

describe('review-grade persistGradeSideEffects', () => {
  it('persists success progression without timezone-dependent date mutation', async () => {
    const client = createPersistenceClientMock();
    const now = new Date('2026-04-02T09:00:00.000Z');
    const nextDue = new Date('2026-04-02T17:00:00.000Z');

    await persistGradeSideEffects(client, {
      cardId: 'card-1',
      chunkId: 'chunk-1',
      now,
      nextDue,
      nextConsecutiveSuccessCount: 2,
      grade: 'good',
      intervalHours: 8,
      wasSuccessful: true,
      existingCardState: {
        ease: 2.5,
        interval: 4,
        reps: 1,
        lapses: 0,
      },
      mode: 'basic',
    });

    expect(client.chunkReviewState.update).toHaveBeenCalledWith({
      where: { chunkId: 'chunk-1' },
      data: {
        due: new Date('2026-04-02T17:00:00.000Z'),
        consecutiveSuccessCount: 2,
        lastGrade: 'good',
      },
    });
    expect(client.reviewState.upsert).toHaveBeenCalledWith({
      where: { cardId: 'card-1' },
      update: {
        due: new Date('2026-04-02T17:00:00.000Z'),
        interval: 8,
        reps: 2,
        lapses: 0,
        lastGrade: 'good',
      },
      create: {
        cardId: 'card-1',
        ease: DEFAULT_REVIEW_EASE,
        interval: 8,
        due: new Date('2026-04-02T17:00:00.000Z'),
        reps: 1,
        lapses: 0,
        lastGrade: 'good',
      },
    });
    expect(client.reviewLog.create).toHaveBeenCalledWith({
      data: {
        cardId: 'card-1',
        reviewedAt: now,
        grade: 'good',
        oldInterval: 4,
        newInterval: 8,
        oldEase: 2.5,
        newEase: 2.5,
        mode: 'basic',
        wasCorrect: true,
      },
    });
  });

  it('keeps reset semantics deterministic across repeated failures', async () => {
    const client = createPersistenceClientMock();
    const now = new Date('2026-04-02T09:00:00.000Z');
    const firstFailureDue = new Date('2026-04-02T13:00:00.000Z');
    const secondFailureDue = new Date('2026-04-02T17:00:00.000Z');

    await persistGradeSideEffects(client, {
      cardId: 'card-1',
      chunkId: 'chunk-1',
      now,
      nextDue: firstFailureDue,
      nextConsecutiveSuccessCount: 0,
      grade: 'again',
      intervalHours: 4,
      wasSuccessful: false,
      existingCardState: {
        ease: 2.5,
        interval: 8,
        reps: 3,
        lapses: 1,
      },
      mode: 'basic',
    });

    await persistGradeSideEffects(client, {
      cardId: 'card-1',
      chunkId: 'chunk-1',
      now: firstFailureDue,
      nextDue: secondFailureDue,
      nextConsecutiveSuccessCount: 0,
      grade: 'again',
      intervalHours: 4,
      wasSuccessful: false,
      existingCardState: {
        ease: 2.5,
        interval: 4,
        reps: 3,
        lapses: 2,
      },
      mode: 'basic',
    });

    expect(client.chunkReviewState.update).toHaveBeenNthCalledWith(1, {
      where: { chunkId: 'chunk-1' },
      data: {
        due: new Date('2026-04-02T13:00:00.000Z'),
        consecutiveSuccessCount: 0,
        lastGrade: 'again',
      },
    });
    expect(client.chunkReviewState.update).toHaveBeenNthCalledWith(2, {
      where: { chunkId: 'chunk-1' },
      data: {
        due: new Date('2026-04-02T17:00:00.000Z'),
        consecutiveSuccessCount: 0,
        lastGrade: 'again',
      },
    });

    expect(client.reviewState.upsert).toHaveBeenNthCalledWith(1, {
      where: { cardId: 'card-1' },
      update: {
        due: new Date('2026-04-02T13:00:00.000Z'),
        interval: 4,
        reps: 3,
        lapses: 2,
        lastGrade: 'again',
      },
      create: {
        cardId: 'card-1',
        ease: DEFAULT_REVIEW_EASE,
        interval: 4,
        due: new Date('2026-04-02T13:00:00.000Z'),
        reps: 0,
        lapses: 1,
        lastGrade: 'again',
      },
    });
    expect(client.reviewState.upsert).toHaveBeenNthCalledWith(2, {
      where: { cardId: 'card-1' },
      update: {
        due: new Date('2026-04-02T17:00:00.000Z'),
        interval: 4,
        reps: 3,
        lapses: 3,
        lastGrade: 'again',
      },
      create: {
        cardId: 'card-1',
        ease: DEFAULT_REVIEW_EASE,
        interval: 4,
        due: new Date('2026-04-02T17:00:00.000Z'),
        reps: 0,
        lapses: 1,
        lastGrade: 'again',
      },
    });
    expect(client.reviewLog.create).toHaveBeenCalledTimes(2);
  });
});

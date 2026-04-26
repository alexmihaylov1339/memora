import type { ReviewQueueItem } from './review-queries';
import {
  emitReviewGraded,
  emitReviewQueueFetched,
  emitReviewUnsupportedDetected,
  getUnsupportedReasonCounts,
  hashUserId,
  REVIEW_OBSERVABILITY_EVENTS,
} from './review-observability';
import { REVIEW_KIND_UNSUPPORTED_REASONS } from './review-kind-adapter';

function createMockLogger() {
  return {
    log: jest.fn<void, [string]>(),
  };
}

function getLoggedPayload(
  logger: ReturnType<typeof createMockLogger>,
): string {
  const payload = logger.log.mock.calls[0]?.[0];
  if (!payload) {
    throw new Error('Expected at least one logged payload');
  }
  return payload;
}

function parseLoggedEvent(rawMessage: string): Record<string, unknown> {
  return JSON.parse(rawMessage) as Record<string, unknown>;
}

function buildItem(overrides: Partial<ReviewQueueItem> = {}): ReviewQueueItem {
  return {
    cardId: 'card-1',
    deckId: 'deck-1',
    chunkId: 'chunk-1',
    chunkTitle: 'spielen',
    chunkPosition: 0,
    positionInChunk: 0,
    due: new Date('2026-04-26T10:00:00.000Z'),
    kind: 'basic',
    fields: { front: 'spielen', back: 'to play' },
    isReviewSupported: true,
    reviewUnsupportedReason: null,
    cardCreatedAt: new Date('2026-04-20T10:00:00.000Z'),
    consecutiveSuccessCount: 0,
    ...overrides,
  };
}

describe('review-observability', () => {
  it('hashes user ids to stable pseudonymous values', () => {
    const first = hashUserId('user-1');
    const second = hashUserId('user-1');
    const different = hashUserId('user-2');

    expect(first).toHaveLength(16);
    expect(second).toBe(first);
    expect(different).not.toBe(first);
  });

  it('counts unsupported reasons deterministically', () => {
    const counts = getUnsupportedReasonCounts([
      buildItem(),
      buildItem({
        cardId: 'card-2',
        isReviewSupported: false,
        reviewUnsupportedReason:
          REVIEW_KIND_UNSUPPORTED_REASONS.kindNotReviewEnabled,
      }),
      buildItem({
        cardId: 'card-3',
        isReviewSupported: false,
        reviewUnsupportedReason: REVIEW_KIND_UNSUPPORTED_REASONS.invalidPayload,
      }),
    ]);

    expect(counts).toEqual({
      [REVIEW_KIND_UNSUPPORTED_REASONS.kindNotReviewEnabled]: 1,
      [REVIEW_KIND_UNSUPPORTED_REASONS.invalidPayload]: 1,
    });
  });

  it('emits queue fetched events with reason breakdown and no raw user id', () => {
    const logger = createMockLogger();
    const generatedAt = new Date('2026-04-26T10:00:00.000Z');

    emitReviewQueueFetched(logger, {
      userId: 'user-1',
      generatedAt,
      items: [
        buildItem(),
        buildItem({
          cardId: 'card-2',
          isReviewSupported: false,
          reviewUnsupportedReason:
            REVIEW_KIND_UNSUPPORTED_REASONS.kindNotReviewEnabled,
        }),
      ],
    });

    expect(logger.log).toHaveBeenCalledTimes(1);
    const payload = parseLoggedEvent(getLoggedPayload(logger));
    expect(payload).toEqual(
      expect.objectContaining({
        event: REVIEW_OBSERVABILITY_EVENTS.queueFetched,
        userIdHash: hashUserId('user-1'),
        queueSize: 2,
        supportedCount: 1,
        unsupportedCount: 1,
        generatedAt: generatedAt.toISOString(),
      }),
    );
    expect(payload.userId).toBeUndefined();
  });

  it('emits graded events with latency and metadata fields', () => {
    const logger = createMockLogger();
    const generatedAt = new Date('2026-04-26T11:00:00.000Z');

    emitReviewGraded(logger, {
      userId: 'user-1',
      cardId: 'card-1',
      kind: 'basic',
      grade: 'good',
      isReviewSupported: true,
      reviewUnsupportedReason: null,
      latencyMs: 42,
      generatedAt,
    });

    expect(parseLoggedEvent(getLoggedPayload(logger))).toEqual(
      expect.objectContaining({
        event: REVIEW_OBSERVABILITY_EVENTS.graded,
        userIdHash: hashUserId('user-1'),
        cardId: 'card-1',
        kind: 'basic',
        grade: 'good',
        isReviewSupported: true,
        reviewUnsupportedReason: null,
        latencyMs: 42,
        generatedAt: generatedAt.toISOString(),
      }),
    );
  });

  it('emits unsupported detection events for queue/grade sources', () => {
    const logger = createMockLogger();
    const generatedAt = new Date('2026-04-26T12:00:00.000Z');

    emitReviewUnsupportedDetected(logger, {
      userId: 'user-1',
      source: 'grade_attempt',
      reason: REVIEW_KIND_UNSUPPORTED_REASONS.invalidPayload,
      cardId: 'card-1',
      kind: 'basic',
      generatedAt,
    });

    expect(parseLoggedEvent(getLoggedPayload(logger))).toEqual(
      expect.objectContaining({
        event: REVIEW_OBSERVABILITY_EVENTS.unsupportedDetected,
        userIdHash: hashUserId('user-1'),
        source: 'grade_attempt',
        reason: REVIEW_KIND_UNSUPPORTED_REASONS.invalidPayload,
        count: 1,
        cardId: 'card-1',
        kind: 'basic',
        generatedAt: generatedAt.toISOString(),
      }),
    );
  });
});

import { resolveReviewRenderer } from './review-kind-registry';
import {
  REVIEW_UNSUPPORTED_REASONS,
  type ReviewQueueItem,
} from './types';

function buildItem(overrides: Partial<ReviewQueueItem> = {}): ReviewQueueItem {
  return {
    cardId: 'card-1',
    deckId: 'deck-1',
    chunkId: 'chunk-1',
    chunkTitle: 'spielen',
    chunkPosition: 0,
    positionInChunk: 0,
    due: '2026-04-26T10:00:00.000Z',
    kind: 'basic',
    fields: { front: 'spielen', back: 'to play' },
    isReviewSupported: true,
    reviewUnsupportedReason: null,
    consecutiveSuccessCount: 0,
    ...overrides,
  };
}

describe('review-kind-registry', () => {
  it('resolves basic renderer for valid basic items', () => {
    expect(resolveReviewRenderer(buildItem())).toEqual({
      renderer: 'basic',
      basicCardFields: {
        front: 'spielen',
        back: 'to play',
      },
    });
  });

  it('returns unsupported for invalid basic payload', () => {
    expect(
      resolveReviewRenderer(buildItem({ fields: { front: 'spielen' } })),
    ).toEqual({
      renderer: 'unsupported',
      reason: REVIEW_UNSUPPORTED_REASONS.invalidPayload,
    });
  });

  it('returns unsupported for non-review-enabled kinds', () => {
    expect(
      resolveReviewRenderer(
        buildItem({
          kind: 'cloze_text',
          fields: {
            text: 'Ich {{c1::spiele}} gern Tennis.',
            answer: 'spiele',
          },
          isReviewSupported: false,
          reviewUnsupportedReason:
            REVIEW_UNSUPPORTED_REASONS.kindNotReviewEnabled,
        }),
      ),
    ).toEqual({
      renderer: 'unsupported',
      reason: REVIEW_UNSUPPORTED_REASONS.kindNotReviewEnabled,
    });
  });

  it('preserves invalid_payload reason when backend flags unsupported payload', () => {
    expect(
      resolveReviewRenderer(
        buildItem({
          kind: 'basic',
          fields: { front: 'spielen' },
          isReviewSupported: false,
          reviewUnsupportedReason: REVIEW_UNSUPPORTED_REASONS.invalidPayload,
        }),
      ),
    ).toEqual({
      renderer: 'unsupported',
      reason: REVIEW_UNSUPPORTED_REASONS.invalidPayload,
    });
  });

  it('falls back to kind_not_review_enabled when unsupported reason is missing', () => {
    expect(
      resolveReviewRenderer(
        buildItem({
          kind: 'cloze_text',
          isReviewSupported: false,
          reviewUnsupportedReason: null,
        }),
      ),
    ).toEqual({
      renderer: 'unsupported',
      reason: REVIEW_UNSUPPORTED_REASONS.kindNotReviewEnabled,
    });
  });
});

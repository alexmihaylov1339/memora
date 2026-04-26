import type { ReviewQueueItem } from '../reviews.service';
import {
  serializeReviewQueueItem,
  serializeReviewQueueResponse,
} from './review-queue-response.dto';

describe('review-queue-response.dto', () => {
  it('serializes supported items with null unsupported reason', () => {
    const item: ReviewQueueItem = {
      cardId: 'card-1',
      deckId: 'deck-1',
      chunkId: 'chunk-1',
      chunkTitle: 'spielen',
      chunkPosition: 0,
      positionInChunk: 0,
      due: new Date('2026-04-03T10:00:00.000Z'),
      kind: 'basic',
      fields: { front: 'spielen', back: 'to play' },
      isReviewSupported: true,
      reviewUnsupportedReason: null,
      cardCreatedAt: new Date('2026-04-01T10:00:00.000Z'),
      consecutiveSuccessCount: 0,
    };

    expect(serializeReviewQueueItem(item)).toEqual({
      cardId: 'card-1',
      deckId: 'deck-1',
      chunkId: 'chunk-1',
      chunkTitle: 'spielen',
      chunkPosition: 0,
      positionInChunk: 0,
      due: '2026-04-03T10:00:00.000Z',
      kind: 'basic',
      fields: { front: 'spielen', back: 'to play' },
      isReviewSupported: true,
      reviewUnsupportedReason: null,
      consecutiveSuccessCount: 0,
    });
  });

  it('serializes deterministic unsupported reason enum values', () => {
    const items: ReviewQueueItem[] = [
      {
        cardId: 'card-cloze',
        deckId: 'deck-1',
        chunkId: 'chunk-1',
        chunkTitle: 'cloze',
        chunkPosition: 0,
        positionInChunk: 0,
        due: new Date('2026-04-03T10:00:00.000Z'),
        kind: 'cloze_text',
        fields: { text: 'Ich {{c1::spiele}}.', answer: 'spiele' },
        isReviewSupported: false,
        reviewUnsupportedReason: 'kind_not_review_enabled',
        cardCreatedAt: new Date('2026-04-01T10:00:00.000Z'),
        consecutiveSuccessCount: 0,
      },
      {
        cardId: 'card-invalid',
        deckId: 'deck-2',
        chunkId: 'chunk-2',
        chunkTitle: 'invalid',
        chunkPosition: 1,
        positionInChunk: 0,
        due: new Date('2026-04-04T12:00:00.000Z'),
        kind: 'basic',
        fields: { front: 'missing-back' },
        isReviewSupported: false,
        reviewUnsupportedReason: 'invalid_payload',
        cardCreatedAt: new Date('2026-04-01T11:00:00.000Z'),
        consecutiveSuccessCount: 3,
      },
    ];

    expect(serializeReviewQueueResponse(items)).toEqual({
      items: [
        expect.objectContaining({
          cardId: 'card-cloze',
          isReviewSupported: false,
          reviewUnsupportedReason: 'kind_not_review_enabled',
        }),
        expect.objectContaining({
          cardId: 'card-invalid',
          isReviewSupported: false,
          reviewUnsupportedReason: 'invalid_payload',
        }),
      ],
    });
  });
});

import { parseReviewQueueResponse } from './reviewService';
import { REVIEW_UNSUPPORTED_REASONS } from '../types';

describe('reviewService.parseReviewQueueResponse', () => {
  it('parses valid queue responses with required metadata fields', () => {
    const response = parseReviewQueueResponse({
      items: [
        {
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
        },
        {
          cardId: 'card-2',
          deckId: 'deck-1',
          chunkId: 'chunk-1',
          chunkTitle: 'spielen',
          chunkPosition: 0,
          positionInChunk: 1,
          due: '2026-04-26T12:00:00.000Z',
          kind: 'cloze_text',
          fields: {
            text: 'Ich {{c1::spiele}} gern Tennis.',
            answer: 'spiele',
          },
          isReviewSupported: false,
          reviewUnsupportedReason:
            REVIEW_UNSUPPORTED_REASONS.kindNotReviewEnabled,
          consecutiveSuccessCount: 1,
        },
      ],
    });

    expect(response.items).toHaveLength(2);
    expect(response.items[0]).toEqual(
      expect.objectContaining({
        cardId: 'card-1',
        isReviewSupported: true,
        reviewUnsupportedReason: null,
      }),
    );
    expect(response.items[1]).toEqual(
      expect.objectContaining({
        cardId: 'card-2',
        isReviewSupported: false,
        reviewUnsupportedReason:
          REVIEW_UNSUPPORTED_REASONS.kindNotReviewEnabled,
      }),
    );
  });

  it('throws for invalid unsupported reason values', () => {
    expect(() =>
      parseReviewQueueResponse({
        items: [
          {
            cardId: 'card-1',
            deckId: 'deck-1',
            chunkId: 'chunk-1',
            chunkTitle: 'spielen',
            chunkPosition: 0,
            positionInChunk: 0,
            due: '2026-04-26T10:00:00.000Z',
            kind: 'basic',
            fields: { front: 'spielen', back: 'to play' },
            isReviewSupported: false,
            reviewUnsupportedReason: 'bad_reason',
            consecutiveSuccessCount: 0,
          },
        ],
      }),
    ).toThrow('Invalid reviewUnsupportedReason in review queue response');
  });

  it('throws when required review metadata fields are missing', () => {
    expect(() =>
      parseReviewQueueResponse({
        items: [
          {
            cardId: 'card-1',
            deckId: 'deck-1',
            chunkId: 'chunk-1',
            chunkTitle: 'spielen',
            chunkPosition: 0,
            positionInChunk: 0,
            due: '2026-04-26T10:00:00.000Z',
            kind: 'basic',
            fields: { front: 'spielen', back: 'to play' },
            reviewUnsupportedReason: null,
            consecutiveSuccessCount: 0,
          },
        ],
      }),
    ).toThrow('Invalid review queue item contract');
  });
});

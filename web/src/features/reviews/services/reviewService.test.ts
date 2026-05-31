import {
  parsePracticeResponse,
  parseReviewQueueResponse,
  parseWhatDidYouHearRoundResponse,
} from './reviewService';
import { REVIEW_UNSUPPORTED_REASONS } from '../types';

function buildWhatDidYouHearAsset(path: string) {
  return {
    path,
    mimeType: path.endsWith('.mp3') ? 'audio/mpeg' : 'image/jpeg',
    size: 100,
    url: `https://assets.test/${path}`,
  };
}

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

describe('reviewService.parsePracticeResponse', () => {
  it('parses practice items without due review metadata', () => {
    const response = parsePracticeResponse({
      items: [
        {
          cardId: 'card-1',
          deckId: 'deck-1',
          chunkId: 'chunk-1',
          chunkTitle: 'spielen',
          chunkPosition: 0,
          positionInChunk: 0,
          kind: 'basic',
          fields: { front: 'spielen', back: 'to play' },
          isReviewSupported: true,
          reviewUnsupportedReason: null,
        },
      ],
    });

    expect(response.items).toEqual([
      expect.objectContaining({
        cardId: 'card-1',
        isReviewSupported: true,
        reviewUnsupportedReason: null,
      }),
    ]);
  });
});

describe('reviewService.parseWhatDidYouHearRoundResponse', () => {
  it('parses ready quiz rounds with signed audio and image URLs', () => {
    const response = parseWhatDidYouHearRoundResponse({
      status: 'ready',
      round: {
        deckId: 'deck-1',
        choiceCount: 4,
        eligibleCardCount: 2,
        sessionCards: [
          {
            cardId: 'card-1',
            label: 'Car',
            imageAsset: buildWhatDidYouHearAsset('kids-images/car.jpg'),
            audioAsset: buildWhatDidYouHearAsset('kids-audio/car.mp3'),
            quizTags: ['vehicles'],
          },
          {
            cardId: 'card-2',
            label: 'Bus',
            imageAsset: buildWhatDidYouHearAsset('kids-images/bus.jpg'),
            audioAsset: buildWhatDidYouHearAsset('kids-audio/bus.mp3'),
            quizTags: ['vehicles'],
          },
        ],
        targetCard: {
          cardId: 'card-1',
          label: 'Car',
          audioAsset: buildWhatDidYouHearAsset('kids-audio/car.mp3'),
          quizTags: ['vehicles'],
        },
        choices: [
          {
            id: 'choice-card-1',
            cardId: 'card-1',
            imageAsset: buildWhatDidYouHearAsset('kids-images/car.jpg'),
            isCorrect: true,
            isDisabled: false,
            label: null,
          },
          {
            id: 'placeholder-1',
            cardId: null,
            imageAsset: null,
            isCorrect: false,
            isDisabled: true,
            label: 'No image',
          },
        ],
      },
    });

    expect(response).toEqual({
      status: 'ready',
      round: expect.objectContaining({
        deckId: 'deck-1',
        targetCard: expect.objectContaining({
          audioAsset: expect.objectContaining({
            url: 'https://assets.test/kids-audio/car.mp3',
          }),
        }),
        sessionCards: expect.arrayContaining([
          expect.objectContaining({
            cardId: 'card-2',
            imageAsset: expect.objectContaining({
              url: 'https://assets.test/kids-images/bus.jpg',
            }),
            audioAsset: expect.objectContaining({
              url: 'https://assets.test/kids-audio/bus.mp3',
            }),
          }),
        ]),
        choices: expect.arrayContaining([
          expect.objectContaining({
            id: 'choice-card-1',
            imageAsset: expect.objectContaining({
              url: 'https://assets.test/kids-images/car.jpg',
            }),
          }),
          expect.objectContaining({
            id: 'placeholder-1',
            isDisabled: true,
            label: 'No image',
          }),
        ]),
      }),
    });
  });

  it('parses non-ready quiz states', () => {
    expect(
      parseWhatDidYouHearRoundResponse({
        status: 'not_enough_eligible_cards',
        eligibleCardCount: 1,
        minimumEligibleCardCount: 2,
        choiceCount: 4,
      }),
    ).toEqual({
      status: 'not_enough_eligible_cards',
      eligibleCardCount: 1,
      minimumEligibleCardCount: 2,
      choiceCount: 4,
    });

  });

  it('rejects quiz assets without signed URLs', () => {
    expect(() =>
      parseWhatDidYouHearRoundResponse({
        status: 'ready',
        round: {
          deckId: 'deck-1',
          choiceCount: 4,
          eligibleCardCount: 2,
          targetCard: {
            cardId: 'card-1',
            label: 'Car',
            audioAsset: {
              path: 'kids-audio/car.mp3',
              mimeType: 'audio/mpeg',
              size: 100,
            },
            quizTags: [],
          },
          sessionCards: [],
          choices: [],
        },
      }),
    ).toThrow('Invalid What Did You Hear? asset contract');
  });
});

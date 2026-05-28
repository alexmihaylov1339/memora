import type { ReviewQueueItem } from '../review-queue';
import {
  buildWhatDidYouHearQuizRound,
  collectWhatDidYouHearEligibleCards,
  WHAT_DID_YOU_HEAR_CONSTANTS,
} from './what-did-you-hear-quiz';

function buildQueueItem(cardId: string): ReviewQueueItem {
  return {
    cardId,
    deckId: 'deck-1',
    chunkId: `standalone:${cardId}`,
    chunkTitle: 'Standalone Card',
    chunkPosition: 0,
    positionInChunk: 0,
    due: new Date('2026-05-28T10:00:00.000Z'),
    kind: 'image_audio',
    fields: {},
    isReviewSupported: false,
    reviewUnsupportedReason: 'kind_not_review_enabled',
    cardCreatedAt: new Date('2026-05-28T09:00:00.000Z'),
    consecutiveSuccessCount: 0,
  };
}

describe('what-did-you-hear quiz builder', () => {
  it('collects valid image_audio cards and skips invalid payloads', () => {
    expect(
      collectWhatDidYouHearEligibleCards([
        {
          id: 'card-1',
          fields: {
            label: 'Car',
            imageAsset: {
              path: 'kids-images/user-1/car.jpg',
              mimeType: 'image/jpeg',
              size: 100,
            },
            audioAsset: {
              path: 'kids-audio/user-1/car.mp3',
              mimeType: 'audio/mpeg',
              size: 100,
            },
            topic: 'Vehicles',
            quizTags: ['transport'],
          },
        },
        {
          id: 'card-2',
          fields: {
            label: 'Broken',
          },
        },
      ]),
    ).toEqual([
      {
        cardId: 'card-1',
        label: 'Car',
        normalizedLabel: 'car',
        imageAsset: {
          path: 'kids-images/user-1/car.jpg',
          mimeType: 'image/jpeg',
          size: 100,
        },
        audioAsset: {
          path: 'kids-audio/user-1/car.mp3',
          mimeType: 'audio/mpeg',
          size: 100,
        },
        topic: 'Vehicles',
        quizTags: ['transport'],
      },
    ]);
  });

  it('returns not_enough_eligible_cards when fewer than two image-audio cards exist', () => {
    const eligibleCards = collectWhatDidYouHearEligibleCards([
      {
        id: 'card-1',
        fields: {
          label: 'Car',
          imageAsset: {
            path: 'kids-images/user-1/car.jpg',
            mimeType: 'image/jpeg',
            size: 100,
          },
          audioAsset: {
            path: 'kids-audio/user-1/car.mp3',
            mimeType: 'audio/mpeg',
            size: 100,
          },
        },
      },
    ]);

    expect(
      buildWhatDidYouHearQuizRound({
        choiceCount: 4,
        deckId: 'deck-1',
        eligibleCards,
        queueItems: [buildQueueItem('card-1')],
        random: () => 0,
      }),
    ).toEqual({
      status: 'not_enough_eligible_cards',
      eligibleCardCount: 1,
      minimumEligibleCardCount:
        WHAT_DID_YOU_HEAR_CONSTANTS.minimumEligibleCardCount,
      choiceCount: 4,
    });
  });

  it('returns no_due_target when no due image-audio queue item matches the eligible pool', () => {
    const eligibleCards = collectWhatDidYouHearEligibleCards([
      {
        id: 'card-1',
        fields: {
          label: 'Car',
          imageAsset: {
            path: 'kids-images/user-1/car.jpg',
            mimeType: 'image/jpeg',
            size: 100,
          },
          audioAsset: {
            path: 'kids-audio/user-1/car.mp3',
            mimeType: 'audio/mpeg',
            size: 100,
          },
        },
      },
      {
        id: 'card-2',
        fields: {
          label: 'Bus',
          imageAsset: {
            path: 'kids-images/user-1/bus.jpg',
            mimeType: 'image/jpeg',
            size: 100,
          },
          audioAsset: {
            path: 'kids-audio/user-1/bus.mp3',
            mimeType: 'audio/mpeg',
            size: 100,
          },
        },
      },
    ]);

    expect(
      buildWhatDidYouHearQuizRound({
        choiceCount: 4,
        deckId: 'deck-1',
        eligibleCards,
        queueItems: [buildQueueItem('card-3')],
        random: () => 0,
      }),
    ).toEqual({
      status: 'no_due_target',
      eligibleCardCount: 2,
      choiceCount: 4,
    });
  });

  it('builds a randomized round, preferring distinct labels before fallback duplicates', () => {
    const eligibleCards = collectWhatDidYouHearEligibleCards([
      {
        id: 'card-1',
        fields: {
          label: 'Car',
          imageAsset: {
            path: 'kids-images/user-1/car.jpg',
            mimeType: 'image/jpeg',
            size: 100,
          },
          audioAsset: {
            path: 'kids-audio/user-1/car.mp3',
            mimeType: 'audio/mpeg',
            size: 100,
          },
        },
      },
      {
        id: 'card-2',
        fields: {
          label: 'Car',
          imageAsset: {
            path: 'kids-images/user-1/car-2.jpg',
            mimeType: 'image/jpeg',
            size: 100,
          },
          audioAsset: {
            path: 'kids-audio/user-1/car-2.mp3',
            mimeType: 'audio/mpeg',
            size: 100,
          },
        },
      },
      {
        id: 'card-3',
        fields: {
          label: 'Bus',
          imageAsset: {
            path: 'kids-images/user-1/bus.jpg',
            mimeType: 'image/jpeg',
            size: 100,
          },
          audioAsset: {
            path: 'kids-audio/user-1/bus.mp3',
            mimeType: 'audio/mpeg',
            size: 100,
          },
        },
      },
    ]);

    const result = buildWhatDidYouHearQuizRound({
      choiceCount: 4,
      deckId: 'deck-1',
      eligibleCards,
      queueItems: [buildQueueItem('card-1')],
      random: () => 0,
    });

    expect(result.status).toBe('ready');
    if (result.status !== 'ready') {
      throw new Error('Expected a ready What Did You Hear? round');
    }

    expect(result.round.deckId).toBe('deck-1');
    expect(result.round.choiceCount).toBe(4);
    expect(result.round.eligibleCardCount).toBe(3);
    expect(result.round.targetCard).toEqual(eligibleCards[0]);
    expect(result.round.targetQueueItem).toEqual(buildQueueItem('card-1'));
    expect(result.round.choices).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          cardId: 'card-1',
          isCorrect: true,
          isDisabled: false,
        }),
        expect.objectContaining({
          cardId: 'card-3',
          isCorrect: false,
          isDisabled: false,
        }),
        expect.objectContaining({
          cardId: 'card-2',
          isCorrect: false,
          isDisabled: false,
        }),
        expect.objectContaining({
          cardId: null,
          isDisabled: true,
        }),
      ]),
    );
  });
});

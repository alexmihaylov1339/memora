import {
  buildWhatDidYouHearQuizRound,
  collectWhatDidYouHearEligibleCards,
  WHAT_DID_YOU_HEAR_CONSTANTS,
} from './what-did-you-hear-quiz';

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

  it('builds a round from deck-eligible cards even when no review item is due', () => {
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
        random: () => 0,
      }),
    ).toEqual(
      expect.objectContaining({
        status: 'ready',
        round: expect.objectContaining({
          targetCard: eligibleCards[0],
        }),
      }),
    );
  });

  it('randomizes the initial target instead of always starting from the first card', () => {
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
      {
        id: 'card-3',
        fields: {
          label: 'Train',
          imageAsset: {
            path: 'kids-images/user-1/train.jpg',
            mimeType: 'image/jpeg',
            size: 100,
          },
          audioAsset: {
            path: 'kids-audio/user-1/train.mp3',
            mimeType: 'audio/mpeg',
            size: 100,
          },
        },
      },
      {
        id: 'card-4',
        fields: {
          label: 'Bike',
          imageAsset: {
            path: 'kids-images/user-1/bike.jpg',
            mimeType: 'image/jpeg',
            size: 100,
          },
          audioAsset: {
            path: 'kids-audio/user-1/bike.mp3',
            mimeType: 'audio/mpeg',
            size: 100,
          },
        },
      },
    ]);

    const result = buildWhatDidYouHearQuizRound({
      choiceCount: 2,
      deckId: 'deck-1',
      eligibleCards,
      random: () => 0.75,
    });

    expect(result.status).toBe('ready');
    if (result.status !== 'ready') {
      throw new Error('Expected a ready What Did You Hear? round');
    }

    expect(result.round.targetCard.cardId).toBe('card-4');
    expect(result.round.choiceCount).toBe(4);
    expect(result.round.choices).toHaveLength(4);
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
      random: () => 0,
    });

    expect(result.status).toBe('ready');
    if (result.status !== 'ready') {
      throw new Error('Expected a ready What Did You Hear? round');
    }

    expect(result.round.deckId).toBe('deck-1');
    expect(result.round.choiceCount).toBe(3);
    expect(result.round.eligibleCardCount).toBe(3);
    expect(result.round.targetCard).toEqual(eligibleCards[0]);
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
      ]),
    );
    expect(result.round.choices).toHaveLength(3);
  });

  it('advances to the next eligible deck card after the submitted target', () => {
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

    const result = buildWhatDidYouHearQuizRound({
      choiceCount: 2,
      deckId: 'deck-1',
      eligibleCards,
      random: () => 0,
      targetCardId: 'card-1',
    });

    expect(result.status).toBe('ready');
    if (result.status !== 'ready') {
      throw new Error('Expected a ready What Did You Hear? round');
    }

    expect(result.round.targetCard.cardId).toBe('card-2');
  });
});

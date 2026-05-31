import type {
  WhatDidYouHearReadyRound,
  WhatDidYouHearSessionCard,
} from '../types';
import { buildNextWhatDidYouHearRound } from './whatDidYouHearRoundBuilder';

function buildAsset(path: string) {
  return {
    path,
    mimeType: path.endsWith('.mp3') ? 'audio/mpeg' : 'image/jpeg',
    size: 100,
    url: `https://assets.test/${path}`,
  };
}

function buildSessionCard(
  cardId: string,
  label: string,
): WhatDidYouHearSessionCard {
  return {
    cardId,
    label,
    imageAsset: buildAsset(`kids-images/${cardId}.jpg`),
    audioAsset: buildAsset(`kids-audio/${cardId}.mp3`),
    quizTags: [],
  };
}

function buildRound(
  sessionCards: WhatDidYouHearSessionCard[],
): WhatDidYouHearReadyRound {
  return {
    deckId: 'deck-1',
    choiceCount: 2,
    eligibleCardCount: sessionCards.length,
    sessionCards,
    targetCard: sessionCards[0]!,
    choices: [],
  };
}

describe('buildNextWhatDidYouHearRound', () => {
  it('uses four real image choices when the session has four or more cards', () => {
    const sessionCards = [
      buildSessionCard('card-1', 'Car'),
      buildSessionCard('card-2', 'Bus'),
      buildSessionCard('card-3', 'Train'),
      buildSessionCard('card-4', 'Bike'),
      buildSessionCard('card-5', 'Boat'),
    ];

    const result = buildNextWhatDidYouHearRound(
      buildRound(sessionCards),
      'card-1',
      () => 0,
    );

    expect(result.status).toBe('ready');
    if (result.status !== 'ready') {
      throw new Error('Expected a ready What Did You Hear? round');
    }

    expect(result.round.choiceCount).toBe(4);
    expect(result.round.choices).toHaveLength(4);
    expect(result.round.choices.every((choice) => choice.cardId)).toBe(true);
    expect(result.round.targetCard.cardId).toBe('card-2');
  });
});

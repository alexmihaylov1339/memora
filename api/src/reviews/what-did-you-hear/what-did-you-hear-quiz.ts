import type { StoredCardAsset } from '../../cards/card-asset-types';
import { parseStoredImageAudioCardFields } from '../../cards/image-audio-card-kind';
const MINIMUM_ELIGIBLE_CARD_COUNT = 2;
const MAXIMUM_CHOICE_COUNT = 4;
const PLACEHOLDER_LABEL = 'No image';

export interface WhatDidYouHearEligibleCard {
  cardId: string;
  label: string;
  normalizedLabel: string;
  imageAsset: StoredCardAsset;
  audioAsset: StoredCardAsset;
  topic?: string;
  quizTags: string[];
}

export interface WhatDidYouHearQuizChoice {
  id: string;
  cardId: string | null;
  imageAsset: StoredCardAsset | null;
  isCorrect: boolean;
  isDisabled: boolean;
}

export interface WhatDidYouHearQuizRound {
  deckId: string;
  choiceCount: number;
  eligibleCardCount: number;
  sessionCards: WhatDidYouHearEligibleCard[];
  targetCard: WhatDidYouHearEligibleCard;
  choices: WhatDidYouHearQuizChoice[];
}

export type WhatDidYouHearQuizRoundResult =
  | {
      status: 'not_enough_eligible_cards';
      eligibleCardCount: number;
      minimumEligibleCardCount: typeof MINIMUM_ELIGIBLE_CARD_COUNT;
      choiceCount: number;
    }
  | {
      status: 'ready';
      round: WhatDidYouHearQuizRound;
    };

interface EligibleCardSource {
  id: string;
  fields: unknown;
}

function normalizeLabel(label: string): string {
  return label.trim().toLowerCase();
}

function shuffleInPlace<T>(items: T[], random: () => number): T[] {
  const nextItems = [...items];

  for (let index = nextItems.length - 1; index > 0; index -= 1) {
    const nextIndex = Math.floor(random() * (index + 1));
    const currentItem = nextItems[index];
    nextItems[index] = nextItems[nextIndex]!;
    nextItems[nextIndex] = currentItem!;
  }

  return nextItems;
}

function buildPlaceholderChoice(index: number): WhatDidYouHearQuizChoice {
  return {
    id: `placeholder-${index + 1}`,
    cardId: null,
    imageAsset: null,
    isCorrect: false,
    isDisabled: true,
  };
}

function pickDistractors(
  cards: WhatDidYouHearEligibleCard[],
  targetCard: WhatDidYouHearEligibleCard,
  desiredCount: number,
  random: () => number,
): WhatDidYouHearEligibleCard[] {
  const candidates = cards.filter((card) => card.cardId !== targetCard.cardId);
  const shuffledCandidates = shuffleInPlace(candidates, random);
  const selected: WhatDidYouHearEligibleCard[] = [];
  const seenLabels = new Set([targetCard.normalizedLabel]);

  for (const candidate of shuffledCandidates) {
    if (selected.length >= desiredCount) {
      return selected;
    }

    if (seenLabels.has(candidate.normalizedLabel)) {
      continue;
    }

    selected.push(candidate);
    seenLabels.add(candidate.normalizedLabel);
  }

  for (const candidate of shuffledCandidates) {
    if (selected.length >= desiredCount) {
      break;
    }

    if (selected.some((card) => card.cardId === candidate.cardId)) {
      continue;
    }

    selected.push(candidate);
  }

  return selected;
}

export function collectWhatDidYouHearEligibleCards(
  cards: EligibleCardSource[],
): WhatDidYouHearEligibleCard[] {
  const eligibleCards: WhatDidYouHearEligibleCard[] = [];
  const seenCardIds = new Set<string>();

  for (const card of cards) {
    if (seenCardIds.has(card.id)) {
      continue;
    }

    seenCardIds.add(card.id);
    const parsedFields = parseStoredImageAudioCardFields(card.fields);
    if (!parsedFields) {
      continue;
    }

    eligibleCards.push({
      cardId: card.id,
      label: parsedFields.label,
      normalizedLabel: normalizeLabel(parsedFields.label),
      imageAsset: parsedFields.imageAsset,
      audioAsset: parsedFields.audioAsset,
      ...(parsedFields.topic ? { topic: parsedFields.topic } : {}),
      quizTags: parsedFields.quizTags ?? [],
    });
  }

  return eligibleCards;
}

export function buildWhatDidYouHearQuizRound(input: {
  choiceCount: number;
  deckId: string;
  eligibleCards: WhatDidYouHearEligibleCard[];
  random?: () => number;
  targetCardId?: string;
}): WhatDidYouHearQuizRoundResult {
  const random = input.random ?? Math.random;
  const effectiveChoiceCount = Math.min(
    MAXIMUM_CHOICE_COUNT,
    input.eligibleCards.length,
  );
  if (input.eligibleCards.length < MINIMUM_ELIGIBLE_CARD_COUNT) {
    return {
      status: 'not_enough_eligible_cards',
      eligibleCardCount: input.eligibleCards.length,
      minimumEligibleCardCount: MINIMUM_ELIGIBLE_CARD_COUNT,
      choiceCount: input.choiceCount,
    };
  }

  const targetCard = selectTargetCard(
    input.eligibleCards,
    random,
    input.targetCardId,
  );
  const distractorCount = Math.max(effectiveChoiceCount - 1, 0);
  const distractors = pickDistractors(
    input.eligibleCards,
    targetCard,
    distractorCount,
    random,
  );
  const cardChoices: WhatDidYouHearQuizChoice[] = [
    {
      id: targetCard.cardId,
      cardId: targetCard.cardId,
      imageAsset: targetCard.imageAsset,
      isCorrect: true,
      isDisabled: false,
    },
    ...distractors.map((card) => ({
      id: card.cardId,
      cardId: card.cardId,
      imageAsset: card.imageAsset,
      isCorrect: false,
      isDisabled: false,
    })),
  ];

  const placeholderCount = Math.max(effectiveChoiceCount - cardChoices.length, 0);
  const choices = shuffleInPlace(
    [
      ...cardChoices,
      ...Array.from({ length: placeholderCount }, (_, index) =>
        buildPlaceholderChoice(index),
      ),
    ],
    random,
  );

  return {
    status: 'ready',
    round: {
      deckId: input.deckId,
      choiceCount: effectiveChoiceCount,
      eligibleCardCount: input.eligibleCards.length,
      sessionCards: input.eligibleCards,
      targetCard,
      choices,
    },
  };
}

function selectTargetCard(
  eligibleCards: WhatDidYouHearEligibleCard[],
  random: () => number,
  targetCardId?: string,
): WhatDidYouHearEligibleCard {
  if (!targetCardId) {
    return eligibleCards[Math.floor(random() * eligibleCards.length)]!;
  }

  const currentIndex = eligibleCards.findIndex(
    (card) => card.cardId === targetCardId,
  );

  if (currentIndex < 0) {
    return eligibleCards[0]!;
  }

  return eligibleCards[(currentIndex + 1) % eligibleCards.length]!;
}

export const WHAT_DID_YOU_HEAR_CONSTANTS = {
  minimumEligibleCardCount: MINIMUM_ELIGIBLE_CARD_COUNT,
  maximumChoiceCount: MAXIMUM_CHOICE_COUNT,
  placeholderLabel: PLACEHOLDER_LABEL,
} as const;

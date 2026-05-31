import type {
  WhatDidYouHearChoice,
  WhatDidYouHearReadyRound,
  WhatDidYouHearRoundResponse,
  WhatDidYouHearSessionCard,
} from '../types';

const PLACEHOLDER_LABEL = 'No image';
const MAXIMUM_CHOICE_COUNT = 4;

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

function selectNextTargetCard(
  sessionCards: WhatDidYouHearSessionCard[],
  currentCardId: string,
): WhatDidYouHearSessionCard {
  const currentIndex = sessionCards.findIndex(
    (card) => card.cardId === currentCardId,
  );

  if (currentIndex < 0) {
    return sessionCards[0]!;
  }

  return sessionCards[(currentIndex + 1) % sessionCards.length]!;
}

function pickDistractors(
  sessionCards: WhatDidYouHearSessionCard[],
  targetCard: WhatDidYouHearSessionCard,
  desiredCount: number,
  random: () => number,
): WhatDidYouHearSessionCard[] {
  const shuffledCandidates = shuffleInPlace(
    sessionCards.filter((card) => card.cardId !== targetCard.cardId),
    random,
  );
  const selected: WhatDidYouHearSessionCard[] = [];
  const seenLabels = new Set([normalizeLabel(targetCard.label)]);

  for (const candidate of shuffledCandidates) {
    if (selected.length >= desiredCount) {
      return selected;
    }

    const normalizedLabel = normalizeLabel(candidate.label);
    if (seenLabels.has(normalizedLabel)) {
      continue;
    }

    selected.push(candidate);
    seenLabels.add(normalizedLabel);
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

function buildPlaceholderChoice(index: number): WhatDidYouHearChoice {
  return {
    id: `placeholder-${index + 1}`,
    cardId: null,
    imageAsset: null,
    isCorrect: false,
    isDisabled: true,
    label: PLACEHOLDER_LABEL,
  };
}

export function buildNextWhatDidYouHearRound(
  currentRound: WhatDidYouHearReadyRound,
  currentCardId: string,
  random: () => number = Math.random,
): WhatDidYouHearRoundResponse {
  const choiceCount = Math.min(
    MAXIMUM_CHOICE_COUNT,
    currentRound.sessionCards.length,
  );
  const targetCard = selectNextTargetCard(
    currentRound.sessionCards,
    currentCardId,
  );
  const distractors = pickDistractors(
    currentRound.sessionCards,
    targetCard,
    Math.max(choiceCount - 1, 0),
    random,
  );
  const cardChoices: WhatDidYouHearChoice[] = [
    {
      id: targetCard.cardId,
      cardId: targetCard.cardId,
      imageAsset: targetCard.imageAsset,
      isCorrect: true,
      isDisabled: false,
      label: null,
    },
    ...distractors.map((card) => ({
      id: card.cardId,
      cardId: card.cardId,
      imageAsset: card.imageAsset,
      isCorrect: false,
      isDisabled: false,
      label: null,
    })),
  ];
  const placeholderCount = Math.max(
    choiceCount - cardChoices.length,
    0,
  );

  return {
    status: 'ready',
    round: {
      deckId: currentRound.deckId,
      choiceCount,
      eligibleCardCount: currentRound.eligibleCardCount,
      sessionCards: currentRound.sessionCards,
      targetCard,
      choices: shuffleInPlace(
        [
          ...cardChoices,
          ...Array.from({ length: placeholderCount }, (_, index) =>
            buildPlaceholderChoice(index),
          ),
        ],
        random,
      ),
    },
  };
}

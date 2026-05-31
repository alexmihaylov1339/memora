import type { StoredCardAsset } from '../../cards/card-asset-types';
import type {
  WhatDidYouHearEligibleCard,
  WhatDidYouHearQuizChoice,
  WhatDidYouHearQuizRound,
  WhatDidYouHearQuizRoundResult,
} from './what-did-you-hear-quiz';
import { WHAT_DID_YOU_HEAR_CONSTANTS } from './what-did-you-hear-quiz';
import type { WhatDidYouHearSubmitResult } from './what-did-you-hear-review';

export interface WhatDidYouHearTargetCardDto {
  cardId: string;
  label: string;
  audioAsset: StoredCardAsset;
  topic?: string;
  quizTags: string[];
}

export interface WhatDidYouHearSessionCardDto extends WhatDidYouHearTargetCardDto {
  imageAsset: StoredCardAsset;
}

export interface WhatDidYouHearChoiceDto {
  id: string;
  cardId: string | null;
  imageAsset: StoredCardAsset | null;
  isCorrect: boolean;
  isDisabled: boolean;
  label: string | null;
}

export interface WhatDidYouHearReadyRoundDto {
  deckId: string;
  choiceCount: number;
  eligibleCardCount: number;
  sessionCards: WhatDidYouHearSessionCardDto[];
  targetCard: WhatDidYouHearTargetCardDto;
  choices: WhatDidYouHearChoiceDto[];
}

export type WhatDidYouHearRoundResponseDto =
  | {
      status: 'not_enough_eligible_cards';
      eligibleCardCount: number;
      minimumEligibleCardCount: number;
      choiceCount: number;
    }
  | {
      status: 'ready';
      round: WhatDidYouHearReadyRoundDto;
    };

export interface SubmitWhatDidYouHearResponseDto {
  accepted: true;
  cardId: string;
  wrongAttemptCount: number;
  nextQuizRound: WhatDidYouHearRoundResponseDto;
}

function serializeTargetCard(
  card: WhatDidYouHearEligibleCard,
): WhatDidYouHearTargetCardDto {
  return {
    cardId: card.cardId,
    label: card.label,
    audioAsset: card.audioAsset,
    ...(card.topic ? { topic: card.topic } : {}),
    quizTags: card.quizTags,
  };
}

function serializeSessionCard(
  card: WhatDidYouHearEligibleCard,
): WhatDidYouHearSessionCardDto {
  return {
    ...serializeTargetCard(card),
    imageAsset: card.imageAsset,
  };
}

function serializeChoice(
  choice: WhatDidYouHearQuizChoice,
): WhatDidYouHearChoiceDto {
  return {
    id: choice.id,
    cardId: choice.cardId,
    imageAsset: choice.imageAsset,
    isCorrect: choice.isCorrect,
    isDisabled: choice.isDisabled,
    label: choice.isDisabled
      ? WHAT_DID_YOU_HEAR_CONSTANTS.placeholderLabel
      : null,
  };
}

function serializeReadyRound(
  round: WhatDidYouHearQuizRound,
): WhatDidYouHearReadyRoundDto {
  return {
    deckId: round.deckId,
    choiceCount: round.choiceCount,
    eligibleCardCount: round.eligibleCardCount,
    sessionCards: round.sessionCards.map(serializeSessionCard),
    targetCard: serializeTargetCard(round.targetCard),
    choices: round.choices.map(serializeChoice),
  };
}

export function serializeWhatDidYouHearRoundResponse(
  result: WhatDidYouHearQuizRoundResult,
): WhatDidYouHearRoundResponseDto {
  if (result.status !== 'ready') {
    return result;
  }

  return {
    status: 'ready',
    round: serializeReadyRound(result.round),
  };
}

export function serializeSubmitWhatDidYouHearResponse(
  result: WhatDidYouHearSubmitResult,
): SubmitWhatDidYouHearResponseDto {
  return {
    accepted: result.accepted,
    cardId: result.cardId,
    wrongAttemptCount: result.wrongAttemptCount,
    nextQuizRound: serializeWhatDidYouHearRoundResponse(result.nextQuizRound),
  };
}

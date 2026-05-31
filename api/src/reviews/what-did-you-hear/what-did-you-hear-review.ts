import { BadRequestException, NotFoundException } from '@nestjs/common';
import type { PrismaService } from '../../../prisma/prisma.service';
import type { CardAssetsService } from '../../cards/card-assets.service';
import { resolveDeckExerciseSettings } from '../../decks/deck-exercise-settings';
import { REVIEW_ERROR_MESSAGES } from '../review-errors';
import {
  buildWhatDidYouHearQuizRound,
  collectWhatDidYouHearEligibleCards,
  type WhatDidYouHearQuizRoundResult,
} from './what-did-you-hear-quiz';

export type { WhatDidYouHearQuizRoundResult };

export interface WhatDidYouHearSubmitResult {
  accepted: true;
  cardId: string;
  wrongAttemptCount: number;
  nextQuizRound: WhatDidYouHearQuizRoundResult;
}

interface SubmitWhatDidYouHearQuizResultInput {
  cardAssets?: CardAssetsService;
  prisma: PrismaService;
  deckId: string;
  cardId: string;
  wrongAttemptCount: number;
}

export async function getWhatDidYouHearQuizRoundForDeck(input: {
  cardAssets?: CardAssetsService;
  prisma: PrismaService;
  deckId: string;
  random?: () => number;
  targetCardId?: string;
}): Promise<WhatDidYouHearQuizRoundResult> {
  const deck = await input.prisma.deck.findUnique({
    where: { id: input.deckId },
    select: {
      exerciseSettings: true,
      deckCards: {
        orderBy: [{ createdAt: 'asc' }, { cardId: 'asc' }],
        select: {
          card: {
            select: {
              id: true,
              kind: true,
              fields: true,
            },
          },
        },
      },
    },
  });

  if (!deck) {
    throw new NotFoundException(REVIEW_ERROR_MESSAGES.deckNotFound);
  }

  const eligibleCards = collectWhatDidYouHearEligibleCards(
    deck.deckCards
      .map((membership) => membership.card)
      .filter((card) => card.kind === 'image_audio'),
  );
  const choiceCount = resolveDeckExerciseSettings(deck.exerciseSettings)
    .whatDidYouHear.choiceCount;

  const result = buildWhatDidYouHearQuizRound({
    choiceCount,
    deckId: input.deckId,
    eligibleCards,
    random: input.random,
    targetCardId: input.targetCardId,
  });

  if (result.status !== 'ready' || !input.cardAssets) {
    return result;
  }

  return resolveWhatDidYouHearQuizRoundAssets(result, input.cardAssets);
}

export async function assertWhatDidYouHearCardEligible(
  prisma: PrismaService,
  deckId: string,
  cardId: string,
): Promise<void> {
  const membership = await prisma.deckCard.findFirst({
    where: {
      deckId,
      cardId,
      card: {
        kind: 'image_audio',
      },
    },
    select: {
      card: {
        select: {
          id: true,
          fields: true,
        },
      },
    },
  });

  const eligibleCard = membership
    ? collectWhatDidYouHearEligibleCards([membership.card])[0]
    : null;

  if (!eligibleCard) {
    throw new BadRequestException(REVIEW_ERROR_MESSAGES.quizCardNotEligible);
  }
}

async function resolveWhatDidYouHearQuizRoundAssets(
  result: Extract<WhatDidYouHearQuizRoundResult, { status: 'ready' }>,
  cardAssets: CardAssetsService,
): Promise<WhatDidYouHearQuizRoundResult> {
  const resolvedCards = await Promise.all(
    result.round.sessionCards.map(async (card) => ({
      ...card,
      imageAsset: await cardAssets.resolveStoredAsset(card.imageAsset),
      audioAsset: await cardAssets.resolveStoredAsset(card.audioAsset),
    })),
  );
  const resolvedCardsById = new Map(
    resolvedCards.map((card) => [card.cardId, card]),
  );

  return {
    status: 'ready',
    round: {
      ...result.round,
      sessionCards: resolvedCards,
      targetCard:
        resolvedCardsById.get(result.round.targetCard.cardId) ??
        result.round.targetCard,
      choices: result.round.choices.map((choice) => ({
        ...choice,
        imageAsset: choice.cardId
          ? resolvedCardsById.get(choice.cardId)?.imageAsset ??
            choice.imageAsset
          : null,
      })),
    },
  };
}

export async function submitWhatDidYouHearQuizResultForDeck(
  input: SubmitWhatDidYouHearQuizResultInput,
): Promise<WhatDidYouHearSubmitResult> {
  await assertWhatDidYouHearCardEligible(
    input.prisma,
    input.deckId,
    input.cardId,
  );

  const nextQuizRound = await getWhatDidYouHearQuizRoundForDeck({
    cardAssets: input.cardAssets,
    deckId: input.deckId,
    prisma: input.prisma,
    targetCardId: input.cardId,
  });

  return {
    accepted: true,
    cardId: input.cardId,
    wrongAttemptCount: input.wrongAttemptCount,
    nextQuizRound,
  };
}

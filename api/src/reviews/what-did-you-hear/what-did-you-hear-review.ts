import { BadRequestException, NotFoundException } from '@nestjs/common';
import type { Grade } from '@prisma/client';
import type { PrismaService } from '../../../prisma/prisma.service';
import { resolveDeckExerciseSettings } from '../../decks/deck-exercise-settings';
import { REVIEW_ERROR_MESSAGES } from '../review-errors';
import { getEligibleQueueItems } from '../review-queries';
import type { GradeChunkReviewResult } from '../review-grade';
import {
  buildWhatDidYouHearQuizRound,
  collectWhatDidYouHearEligibleCards,
  type WhatDidYouHearQuizRoundResult,
} from './what-did-you-hear-quiz';

export type { WhatDidYouHearQuizRoundResult };

export const WHAT_DID_YOU_HEAR_REVIEW_MODE = 'what_did_you_hear';

export interface WhatDidYouHearSubmitResult {
  accepted: true;
  cardId: string;
  wrongAttemptCount: number;
  derivedReviewGrade: Grade;
  review: GradeChunkReviewResult;
  nextQuizRound: WhatDidYouHearQuizRoundResult;
}

interface SubmitWhatDidYouHearQuizResultInput {
  prisma: PrismaService;
  userId: string;
  deckId: string;
  cardId: string;
  wrongAttemptCount: number;
  now: Date;
  applyGrade: (grade: Grade) => Promise<GradeChunkReviewResult | null>;
}

export function deriveWhatDidYouHearReviewGrade(
  wrongAttemptCount: number,
): Grade {
  return wrongAttemptCount === 0 ? 'good' : 'hard';
}

export async function getWhatDidYouHearQuizRoundForDeck(input: {
  prisma: PrismaService;
  userId: string;
  deckId: string;
  now: Date;
  random?: () => number;
}): Promise<WhatDidYouHearQuizRoundResult> {
  const [deck, queueItems] = await Promise.all([
    input.prisma.deck.findUnique({
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
    }),
    getEligibleQueueItems(input.prisma, input.userId, input.now, input.deckId),
  ]);

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

  return buildWhatDidYouHearQuizRound({
    choiceCount,
    deckId: input.deckId,
    eligibleCards,
    queueItems,
    random: input.random,
  });
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

export async function submitWhatDidYouHearQuizResultForDeck(
  input: SubmitWhatDidYouHearQuizResultInput,
): Promise<WhatDidYouHearSubmitResult> {
  await assertWhatDidYouHearCardEligible(
    input.prisma,
    input.deckId,
    input.cardId,
  );

  const grade = deriveWhatDidYouHearReviewGrade(input.wrongAttemptCount);
  const review = await input.applyGrade(grade);

  if (!review) {
    throw new BadRequestException(REVIEW_ERROR_MESSAGES.cardNotReviewable);
  }

  const nextQuizRound = await getWhatDidYouHearQuizRoundForDeck({
    deckId: input.deckId,
    now: input.now,
    prisma: input.prisma,
    userId: input.userId,
  });

  return {
    accepted: true,
    cardId: input.cardId,
    wrongAttemptCount: input.wrongAttemptCount,
    derivedReviewGrade: grade,
    review,
    nextQuizRound,
  };
}

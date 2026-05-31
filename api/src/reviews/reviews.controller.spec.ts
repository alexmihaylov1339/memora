import { BadRequestException, NotFoundException } from '@nestjs/common';
import type { Grade } from '@prisma/client';
import { REVIEW_ERROR_MESSAGES } from './review-errors';
import { REVIEW_KIND_UNSUPPORTED_REASONS } from './review-kind-adapter';
import { ReviewsController } from './reviews.controller';
import type {
  GradeChunkReviewResult,
  PracticeItem,
  ReviewQueueItem,
  WhatDidYouHearQuizRoundResult,
  WhatDidYouHearSubmitResult,
} from './reviews.service';

interface ReviewsServiceMock {
  getEligibleQueueItems: jest.Mock<Promise<ReviewQueueItem[]>>;
  getPracticeItems: jest.Mock<Promise<PracticeItem[]>>;
  getWhatDidYouHearQuizRound: jest.Mock<Promise<WhatDidYouHearQuizRoundResult>>;
  gradeReview: jest.Mock<
    Promise<GradeChunkReviewResult>,
    [string, Grade, string, Date, string]
  >;
  submitWhatDidYouHearQuizResult: jest.Mock<
    Promise<WhatDidYouHearSubmitResult>,
    [string, string, string, number]
  >;
}

function createReviewsServiceMock(): ReviewsServiceMock {
  return {
    getEligibleQueueItems: jest.fn<Promise<ReviewQueueItem[]>, []>(),
    getPracticeItems: jest.fn<Promise<PracticeItem[]>, []>(),
    getWhatDidYouHearQuizRound: jest.fn<
      Promise<WhatDidYouHearQuizRoundResult>,
      []
    >(),
    gradeReview: jest.fn<
      Promise<GradeChunkReviewResult>,
      [string, Grade, string, Date, string]
    >(),
    submitWhatDidYouHearQuizResult: jest.fn<
      Promise<WhatDidYouHearSubmitResult>,
      [string, string, string, number]
    >(),
  };
}

const mockUser = { id: 'user-1', email: 'test@test.com' };

describe('ReviewsController', () => {
  let controller: ReviewsController;
  let reviewsService: ReviewsServiceMock;

  beforeEach(() => {
    reviewsService = createReviewsServiceMock();
    controller = new ReviewsController(reviewsService as never);
  });

  it('returns real scheduler-backed queue items', async () => {
    reviewsService.getEligibleQueueItems.mockResolvedValue([
      {
        cardId: 'card-1',
        deckId: 'deck-1',
        chunkId: 'chunk-1',
        chunkTitle: 'spielen',
        chunkPosition: 0,
        positionInChunk: 0,
        due: new Date('2026-04-03T10:00:00.000Z'),
        kind: 'basic',
        fields: { front: 'spielen 1', back: 'play 1' },
        isReviewSupported: true,
        reviewUnsupportedReason: null,
        cardCreatedAt: new Date('2026-04-02T10:00:00.000Z'),
        consecutiveSuccessCount: 0,
      },
    ]);

    await expect(
      controller.queue(mockUser, { deckId: 'deck-1' }),
    ).resolves.toEqual({
      items: [
        {
          cardId: 'card-1',
          deckId: 'deck-1',
          chunkId: 'chunk-1',
          chunkTitle: 'spielen',
          chunkPosition: 0,
          positionInChunk: 0,
          due: '2026-04-03T10:00:00.000Z',
          kind: 'basic',
          fields: { front: 'spielen 1', back: 'play 1' },
          isReviewSupported: true,
          reviewUnsupportedReason: null,
          consecutiveSuccessCount: 0,
        },
      ],
    });
    expect(reviewsService.getEligibleQueueItems).toHaveBeenCalledWith(
      'user-1',
      expect.any(Date),
      'deck-1',
    );
  });

  it('preserves unsupported review metadata enum values in queue responses', async () => {
    reviewsService.getEligibleQueueItems.mockResolvedValue([
      {
        cardId: 'card-cloze',
        deckId: 'deck-1',
        chunkId: 'chunk-1',
        chunkTitle: 'cloze',
        chunkPosition: 0,
        positionInChunk: 0,
        due: new Date('2026-04-03T10:00:00.000Z'),
        kind: 'cloze_text',
        fields: { text: 'Ich {{c1::spiele}}.', answer: 'spiele' },
        isReviewSupported: false,
        reviewUnsupportedReason:
          REVIEW_KIND_UNSUPPORTED_REASONS.kindNotReviewEnabled,
        cardCreatedAt: new Date('2026-04-02T10:00:00.000Z'),
        consecutiveSuccessCount: 0,
      },
      {
        cardId: 'card-invalid',
        deckId: 'deck-1',
        chunkId: 'chunk-2',
        chunkTitle: 'invalid',
        chunkPosition: 1,
        positionInChunk: 0,
        due: new Date('2026-04-03T11:00:00.000Z'),
        kind: 'basic',
        fields: { front: 'front only' },
        isReviewSupported: false,
        reviewUnsupportedReason: REVIEW_KIND_UNSUPPORTED_REASONS.invalidPayload,
        cardCreatedAt: new Date('2026-04-02T11:00:00.000Z'),
        consecutiveSuccessCount: 0,
      },
    ]);

    await expect(
      controller.queue(mockUser, { deckId: 'deck-1' }),
    ).resolves.toEqual({
      items: [
        expect.objectContaining({
          cardId: 'card-cloze',
          isReviewSupported: false,
          reviewUnsupportedReason:
            REVIEW_KIND_UNSUPPORTED_REASONS.kindNotReviewEnabled,
        }),
        expect.objectContaining({
          cardId: 'card-invalid',
          isReviewSupported: false,
          reviewUnsupportedReason:
            REVIEW_KIND_UNSUPPORTED_REASONS.invalidPayload,
        }),
      ],
    });
  });

  it('returns deck-scoped practice items without due metadata', async () => {
    reviewsService.getPracticeItems.mockResolvedValue([
      {
        cardId: 'card-1',
        deckId: 'deck-1',
        chunkId: 'chunk-1',
        chunkTitle: 'spielen',
        chunkPosition: 0,
        positionInChunk: 0,
        kind: 'basic',
        fields: { front: 'spielen 1', back: 'play 1' },
        isReviewSupported: true,
        reviewUnsupportedReason: null,
        cardCreatedAt: new Date('2026-04-02T10:00:00.000Z'),
      },
    ]);

    await expect(
      controller.practice(mockUser, { deckId: 'deck-1' }),
    ).resolves.toEqual({
      items: [
        {
          cardId: 'card-1',
          deckId: 'deck-1',
          chunkId: 'chunk-1',
          chunkTitle: 'spielen',
          chunkPosition: 0,
          positionInChunk: 0,
          kind: 'basic',
          fields: { front: 'spielen 1', back: 'play 1' },
          isReviewSupported: true,
          reviewUnsupportedReason: null,
        },
      ],
    });
    expect(reviewsService.getPracticeItems).toHaveBeenCalledWith(
      'user-1',
      'deck-1',
    );
  });

  it('returns a serialized What Did You Hear? quiz round', async () => {
    reviewsService.getWhatDidYouHearQuizRound.mockResolvedValue({
      status: 'ready',
      round: {
        deckId: 'deck-1',
        choiceCount: 4,
        eligibleCardCount: 2,
        sessionCards: [
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
            quizTags: [],
          },
        ],
        targetCard: {
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
          quizTags: [],
        },
        choices: [
          {
            id: 'card-1',
            cardId: 'card-1',
            imageAsset: {
              path: 'kids-images/user-1/car.jpg',
              mimeType: 'image/jpeg',
              size: 100,
            },
            isCorrect: true,
            isDisabled: false,
          },
          {
            id: 'placeholder-1',
            cardId: null,
            imageAsset: null,
            isCorrect: false,
            isDisabled: true,
          },
        ],
      },
    });

    await expect(
      controller.whatDidYouHear(mockUser, { deckId: 'deck-1' }),
    ).resolves.toEqual({
      status: 'ready',
      round: expect.objectContaining({
        deckId: 'deck-1',
        sessionCards: [
          expect.objectContaining({
            cardId: 'card-1',
            imageAsset: {
              path: 'kids-images/user-1/car.jpg',
              mimeType: 'image/jpeg',
              size: 100,
            },
          }),
        ],
        targetCard: {
          cardId: 'card-1',
          label: 'Car',
          audioAsset: {
            path: 'kids-audio/user-1/car.mp3',
            mimeType: 'audio/mpeg',
            size: 100,
          },
          quizTags: [],
        },
        choices: [
          expect.objectContaining({
            cardId: 'card-1',
            isCorrect: true,
            label: null,
          }),
          expect.objectContaining({
            cardId: null,
            isDisabled: true,
            label: 'No image',
          }),
        ],
      }),
    });
    expect(reviewsService.getWhatDidYouHearQuizRound).toHaveBeenCalledWith(
      'user-1',
      'deck-1',
    );
  });

  it('submits What Did You Hear? attempts through the dedicated result contract', async () => {
    reviewsService.submitWhatDidYouHearQuizResult.mockResolvedValue({
      accepted: true,
      cardId: 'card-1',
      wrongAttemptCount: 1,
      nextQuizRound: {
        status: 'not_enough_eligible_cards',
        eligibleCardCount: 1,
        minimumEligibleCardCount: 2,
        choiceCount: 4,
      },
    });

    await expect(
      controller.submitWhatDidYouHearResult(
        mockUser,
        { cardId: ' card-1 ' },
        { deckId: 'deck-1' },
        { wrongAttemptCount: 1 },
      ),
    ).resolves.toEqual(
      expect.objectContaining({
        accepted: true,
        cardId: 'card-1',
        wrongAttemptCount: 1,
        nextQuizRound: {
          status: 'not_enough_eligible_cards',
          eligibleCardCount: 1,
          minimumEligibleCardCount: 2,
          choiceCount: 4,
        },
      }),
    );
    expect(reviewsService.submitWhatDidYouHearQuizResult).toHaveBeenCalledWith(
      'user-1',
      'deck-1',
      'card-1',
      1,
    );
  });

  it('rejects invalid What Did You Hear? wrong attempt counts before calling the service', async () => {
    await expect(
      controller.submitWhatDidYouHearResult(
        mockUser,
        { cardId: 'card-1' },
        { deckId: 'deck-1' },
        { wrongAttemptCount: -1 },
      ),
    ).rejects.toThrow(REVIEW_ERROR_MESSAGES.invalidWrongAttemptCount);

    expect(reviewsService.submitWhatDidYouHearQuizResult).not.toHaveBeenCalled();
  });

  it('passes a validated enum grade to the review service', async () => {
    reviewsService.gradeReview.mockResolvedValue({
      cardId: 'card-1',
      grade: 'good',
      wasSuccessful: true,
      advanced: true,
      reset: false,
      previousConsecutiveSuccessCount: 0,
      consecutiveSuccessCount: 1,
      due: new Date('2026-04-03T18:00:00.000Z'),
      intervalHours: 8,
      chunk: {
        chunkId: 'chunk-1',
        deckId: 'deck-1',
        title: 'spielen',
        position: 0,
        due: new Date('2026-04-03T18:00:00.000Z'),
        isDue: false,
        consecutiveSuccessCount: 1,
        requiredConsecutiveSuccesses: 20,
        hasMastery: false,
        totalCards: 2,
        currentCard: {
          cardId: 'card-2',
          sequenceIndex: 1,
        },
        lastGrade: 'good',
      },
      nextActionableItem: {
        cardId: 'card-2',
        deckId: 'deck-1',
        chunkId: 'chunk-1',
        chunkTitle: 'spielen',
        chunkPosition: 0,
        positionInChunk: 1,
        due: new Date('2026-04-03T18:00:00.000Z'),
        kind: 'basic',
        fields: { front: 'spielen 2', back: 'play 2' },
        isReviewSupported: true,
        reviewUnsupportedReason: null,
        cardCreatedAt: new Date('2026-04-03T10:00:00.000Z'),
        consecutiveSuccessCount: 1,
      },
    });

    await expect(
      controller.grade(
        mockUser,
        { cardId: ' card-1 ' },
        { deckId: 'deck-1' },
        { grade: 'good' },
      ),
    ).resolves.toEqual({
      cardId: 'card-1',
      grade: 'good',
      wasSuccessful: true,
      advanced: true,
      reset: false,
      previousConsecutiveSuccessCount: 0,
      consecutiveSuccessCount: 1,
      due: '2026-04-03T18:00:00.000Z',
      intervalHours: 8,
      chunk: {
        chunkId: 'chunk-1',
        deckId: 'deck-1',
        title: 'spielen',
        position: 0,
        due: '2026-04-03T18:00:00.000Z',
        isDue: false,
        consecutiveSuccessCount: 1,
        requiredConsecutiveSuccesses: 20,
        hasMastery: false,
        totalCards: 2,
        currentCard: {
          cardId: 'card-2',
          sequenceIndex: 1,
        },
        lastGrade: 'good',
      },
      nextActionableItem: {
        cardId: 'card-2',
        deckId: 'deck-1',
        chunkId: 'chunk-1',
        chunkTitle: 'spielen',
        chunkPosition: 0,
        positionInChunk: 1,
        due: '2026-04-03T18:00:00.000Z',
        kind: 'basic',
        fields: { front: 'spielen 2', back: 'play 2' },
        isReviewSupported: true,
        reviewUnsupportedReason: null,
        consecutiveSuccessCount: 1,
      },
    });

    expect(reviewsService.gradeReview).toHaveBeenCalledWith(
      'card-1',
      'good',
      'user-1',
      expect.any(Date),
      'deck-1',
    );
  });

  it('returns null nextActionableItem when no next review item exists', async () => {
    reviewsService.gradeReview.mockResolvedValue({
      cardId: 'card-1',
      grade: 'again',
      wasSuccessful: false,
      advanced: false,
      reset: true,
      previousConsecutiveSuccessCount: 1,
      consecutiveSuccessCount: 0,
      due: new Date('2026-04-03T14:00:00.000Z'),
      intervalHours: 4,
      chunk: {
        chunkId: 'chunk-1',
        deckId: 'deck-1',
        title: 'spielen',
        position: 0,
        due: new Date('2026-04-03T14:00:00.000Z'),
        isDue: false,
        consecutiveSuccessCount: 0,
        requiredConsecutiveSuccesses: 20,
        hasMastery: false,
        totalCards: 2,
        currentCard: {
          cardId: 'card-1',
          sequenceIndex: 0,
        },
        lastGrade: 'again',
      },
      nextActionableItem: null,
    });

    await expect(
      controller.grade(
        mockUser,
        { cardId: 'card-1' },
        { deckId: 'deck-1' },
        { grade: 'again' },
      ),
    ).resolves.toEqual(
      expect.objectContaining({
        cardId: 'card-1',
        grade: 'again',
        nextActionableItem: null,
      }),
    );
  });

  it('rejects invalid grades before calling the service', async () => {
    await expect(
      controller.grade(
        mockUser,
        { cardId: 'card-1' },
        { deckId: 'deck-1' },
        { grade: 'invalid-grade' as Grade },
      ),
    ).rejects.toThrow(REVIEW_ERROR_MESSAGES.invalidGrade);

    expect(reviewsService.gradeReview).not.toHaveBeenCalled();
  });

  it('rejects invalid card ids before calling the service', async () => {
    await expect(
      controller.grade(
        mockUser,
        { cardId: '   ' },
        { deckId: 'deck-1' },
        { grade: 'good' },
      ),
    ).rejects.toThrow(REVIEW_ERROR_MESSAGES.cardIdRequired);

    expect(reviewsService.gradeReview).not.toHaveBeenCalled();
  });

  it('preserves not found and not actionable review errors', async () => {
    reviewsService.gradeReview
      .mockRejectedValueOnce(
        new NotFoundException(REVIEW_ERROR_MESSAGES.cardNotFound),
      )
      .mockRejectedValueOnce(
        new BadRequestException(REVIEW_ERROR_MESSAGES.cardNotReviewable),
      );

    await expect(
      controller.grade(
        mockUser,
        { cardId: 'card-missing' },
        { deckId: 'deck-1' },
        { grade: 'good' },
      ),
    ).rejects.toThrow(REVIEW_ERROR_MESSAGES.cardNotFound);

    await expect(
      controller.grade(
        mockUser,
        { cardId: 'card-1' },
        { deckId: 'deck-1' },
        { grade: 'good' },
      ),
    ).rejects.toThrow(REVIEW_ERROR_MESSAGES.cardNotReviewable);
  });
});

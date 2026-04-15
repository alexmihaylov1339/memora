import { BadRequestException, NotFoundException } from '@nestjs/common';
import type { Grade } from '@prisma/client';
import { REVIEW_ERROR_MESSAGES } from './review-errors';
import { ReviewsController } from './reviews.controller';
import type {
  GradeChunkReviewResult,
  ReviewQueueItem,
} from './reviews.service';

interface ReviewsServiceMock {
  getEligibleQueueItems: jest.Mock<Promise<ReviewQueueItem[]>>;
  gradeReview: jest.Mock<
    Promise<GradeChunkReviewResult>,
    [string, Grade, string]
  >;
}

function createReviewsServiceMock(): ReviewsServiceMock {
  return {
    getEligibleQueueItems: jest.fn<Promise<ReviewQueueItem[]>, []>(),
    gradeReview: jest.fn<
      Promise<GradeChunkReviewResult>,
      [string, Grade, string]
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
        cardCreatedAt: new Date('2026-04-02T10:00:00.000Z'),
        consecutiveSuccessCount: 0,
      },
    ]);

    await expect(controller.queue(mockUser)).resolves.toEqual({
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
          consecutiveSuccessCount: 0,
        },
      ],
    });
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
        cardCreatedAt: new Date('2026-04-03T10:00:00.000Z'),
        consecutiveSuccessCount: 1,
      },
    });

    await expect(
      controller.grade(mockUser, { cardId: ' card-1 ' }, { grade: 'good' }),
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
        consecutiveSuccessCount: 1,
      },
    });

    expect(reviewsService.gradeReview).toHaveBeenCalledWith(
      'card-1',
      'good',
      'user-1',
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
      controller.grade(mockUser, { cardId: 'card-1' }, { grade: 'again' }),
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
        { grade: 'invalid-grade' as Grade },
      ),
    ).rejects.toThrow(REVIEW_ERROR_MESSAGES.invalidGrade);

    expect(reviewsService.gradeReview).not.toHaveBeenCalled();
  });

  it('rejects invalid card ids before calling the service', async () => {
    await expect(
      controller.grade(mockUser, { cardId: '   ' }, { grade: 'good' }),
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
      controller.grade(mockUser, { cardId: 'card-missing' }, { grade: 'good' }),
    ).rejects.toThrow(REVIEW_ERROR_MESSAGES.cardNotFound);

    await expect(
      controller.grade(mockUser, { cardId: 'card-1' }, { grade: 'good' }),
    ).rejects.toThrow(REVIEW_ERROR_MESSAGES.cardNotReviewable);
  });
});

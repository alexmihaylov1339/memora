import type { Grade } from '@prisma/client';
import type { PrismaService } from '../../prisma/prisma.service';
import type { GradeChunkReviewResult } from './reviews.service';
import { ReviewsService } from './reviews.service';

function createPrismaMock() {
  const prisma = {
    chunk: {
      findFirst: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
    },
    chunkReviewState: {
      upsert: jest.fn(),
      update: jest.fn(),
    },
    reviewState: {
      findUnique: jest.fn(),
      upsert: jest.fn(),
    },
    reviewLog: {
      create: jest.fn(),
    },
    $transaction: jest.fn(),
  };

  const runInTransaction = async <T>(
    callback: (tx: typeof prisma) => Promise<T>,
  ): Promise<T> => await callback(prisma);

  prisma.$transaction.mockImplementation(runInTransaction as never);

  return prisma;
}

describe('ReviewsService', () => {
  let service: ReviewsService;
  let prisma: ReturnType<typeof createPrismaMock>;

  beforeEach(() => {
    prisma = createPrismaMock();
    service = new ReviewsService(prisma as unknown as PrismaService);
  });

  describe('getChunkProgress', () => {
    it('returns null when the chunk does not exist', async () => {
      prisma.chunk.findUnique.mockResolvedValue(null);

      await expect(service.getChunkProgress('chunk-1')).resolves.toBeNull();
      expect(prisma.chunkReviewState.upsert).not.toHaveBeenCalled();
    });

    it('creates default persisted state and returns the first actionable card', async () => {
      const now = new Date('2026-04-02T09:00:00.000Z');

      prisma.chunk.findUnique.mockResolvedValue({
        id: 'chunk-1',
        deckId: 'deck-1',
        title: 'spielen',
        position: 0,
        chunkCards: [
          { cardId: 'card-1', sequenceIndex: 0 },
          { cardId: 'card-2', sequenceIndex: 1 },
        ],
      });
      prisma.chunkReviewState.upsert.mockResolvedValue({
        id: 'state-1',
        chunkId: 'chunk-1',
        due: now,
        consecutiveSuccessCount: 0,
        lastGrade: null,
        createdAt: now,
        updatedAt: now,
      });

      await expect(service.getChunkProgress('chunk-1', now)).resolves.toEqual({
        chunkId: 'chunk-1',
        deckId: 'deck-1',
        title: 'spielen',
        position: 0,
        due: now,
        isDue: true,
        consecutiveSuccessCount: 0,
        requiredConsecutiveSuccesses: 20,
        hasMastery: false,
        totalCards: 2,
        currentCard: {
          cardId: 'card-1',
          sequenceIndex: 0,
        },
        lastGrade: null,
      });

      expect(prisma.chunkReviewState.upsert).toHaveBeenCalledWith({
        where: { chunkId: 'chunk-1' },
        update: {},
        create: {
          chunkId: 'chunk-1',
          due: now,
          consecutiveSuccessCount: 0,
        },
      });
    });

    it('derives the current card from persisted consecutive progress and wraps through the chunk', async () => {
      const now = new Date('2026-04-02T09:00:00.000Z');
      const futureDue = new Date('2026-04-05T09:00:00.000Z');

      prisma.chunk.findUnique.mockResolvedValue({
        id: 'chunk-1',
        deckId: 'deck-1',
        title: 'spielen',
        position: 2,
        chunkCards: [
          { cardId: 'card-1', sequenceIndex: 0 },
          { cardId: 'card-2', sequenceIndex: 1 },
          { cardId: 'card-3', sequenceIndex: 2 },
        ],
      });
      prisma.chunkReviewState.upsert.mockResolvedValue({
        id: 'state-1',
        chunkId: 'chunk-1',
        due: futureDue,
        consecutiveSuccessCount: 4,
        lastGrade: 'good' satisfies Grade,
        createdAt: now,
        updatedAt: futureDue,
      });

      await expect(service.getChunkProgress('chunk-1', now)).resolves.toEqual(
        expect.objectContaining({
          due: futureDue,
          isDue: false,
          consecutiveSuccessCount: 4,
          hasMastery: false,
          totalCards: 3,
          currentCard: {
            cardId: 'card-2',
            sequenceIndex: 1,
          },
          lastGrade: 'good',
        }),
      );
    });

    it('reports mastery and no actionable card when the chunk has no cards', async () => {
      const now = new Date('2026-04-02T09:00:00.000Z');

      prisma.chunk.findUnique.mockResolvedValue({
        id: 'chunk-1',
        deckId: 'deck-1',
        title: 'empty',
        position: 0,
        chunkCards: [],
      });
      prisma.chunkReviewState.upsert.mockResolvedValue({
        id: 'state-1',
        chunkId: 'chunk-1',
        due: now,
        consecutiveSuccessCount: 20,
        lastGrade: 'easy' satisfies Grade,
        createdAt: now,
        updatedAt: now,
      });

      await expect(service.getChunkProgress('chunk-1', now)).resolves.toEqual(
        expect.objectContaining({
          totalCards: 0,
          currentCard: null,
          hasMastery: true,
          lastGrade: 'easy',
        }),
      );
    });
  });

  describe('getEligibleQueueItems', () => {
    it('returns only the next eligible card for each due chunk', async () => {
      const now = new Date('2026-04-02T09:00:00.000Z');

      prisma.chunk.findMany.mockResolvedValue([
        {
          id: 'chunk-1',
          deckId: 'deck-1',
          title: 'spielen',
          position: 1,
          reviewState: {
            id: 'state-1',
            chunkId: 'chunk-1',
            due: new Date('2026-04-02T08:00:00.000Z'),
            consecutiveSuccessCount: 1,
            lastGrade: 'good' satisfies Grade,
            createdAt: now,
            updatedAt: now,
          },
          chunkCards: [
            {
              cardId: 'card-1',
              sequenceIndex: 0,
              card: {
                id: 'card-1',
                kind: 'basic',
                fields: { front: 'spielen 1', back: 'play 1' },
                createdAt: new Date('2026-04-01T10:00:00.000Z'),
              },
            },
            {
              cardId: 'card-2',
              sequenceIndex: 1,
              card: {
                id: 'card-2',
                kind: 'basic',
                fields: { front: 'spielen 2', back: 'play 2' },
                createdAt: new Date('2026-04-01T11:00:00.000Z'),
              },
            },
          ],
        },
        {
          id: 'chunk-2',
          deckId: 'deck-1',
          title: 'lernen',
          position: 2,
          reviewState: {
            id: 'state-2',
            chunkId: 'chunk-2',
            due: new Date('2026-04-02T07:00:00.000Z'),
            consecutiveSuccessCount: 0,
            lastGrade: null,
            createdAt: now,
            updatedAt: now,
          },
          chunkCards: [
            {
              cardId: 'card-3',
              sequenceIndex: 0,
              card: {
                id: 'card-3',
                kind: 'basic',
                fields: { front: 'lernen 1', back: 'learn 1' },
                createdAt: new Date('2026-04-01T09:00:00.000Z'),
              },
            },
            {
              cardId: 'card-4',
              sequenceIndex: 1,
              card: {
                id: 'card-4',
                kind: 'basic',
                fields: { front: 'lernen 2', back: 'learn 2' },
                createdAt: new Date('2026-04-01T12:00:00.000Z'),
              },
            },
          ],
        },
      ]);

      await expect(service.getEligibleQueueItems(now)).resolves.toEqual([
        expect.objectContaining({
          cardId: 'card-3',
          chunkId: 'chunk-2',
          positionInChunk: 0,
          consecutiveSuccessCount: 0,
        }),
        expect.objectContaining({
          cardId: 'card-2',
          chunkId: 'chunk-1',
          positionInChunk: 1,
          consecutiveSuccessCount: 1,
        }),
      ]);
    });

    it('skips chunks that are not yet due, mastered, or empty', async () => {
      const now = new Date('2026-04-02T09:00:00.000Z');

      prisma.chunk.findMany.mockResolvedValue([
        {
          id: 'chunk-future',
          deckId: 'deck-1',
          title: 'future',
          position: 0,
          reviewState: {
            id: 'state-future',
            chunkId: 'chunk-future',
            due: new Date('2026-04-03T09:00:00.000Z'),
            consecutiveSuccessCount: 0,
            lastGrade: null,
            createdAt: now,
            updatedAt: now,
          },
          chunkCards: [
            {
              cardId: 'card-future',
              sequenceIndex: 0,
              card: {
                id: 'card-future',
                kind: 'basic',
                fields: { front: 'future', back: 'future' },
                createdAt: now,
              },
            },
          ],
        },
        {
          id: 'chunk-mastered',
          deckId: 'deck-1',
          title: 'mastered',
          position: 1,
          reviewState: {
            id: 'state-mastered',
            chunkId: 'chunk-mastered',
            due: new Date('2026-04-02T08:00:00.000Z'),
            consecutiveSuccessCount: 20,
            lastGrade: 'easy' satisfies Grade,
            createdAt: now,
            updatedAt: now,
          },
          chunkCards: [
            {
              cardId: 'card-mastered',
              sequenceIndex: 0,
              card: {
                id: 'card-mastered',
                kind: 'basic',
                fields: { front: 'mastered', back: 'mastered' },
                createdAt: now,
              },
            },
          ],
        },
        {
          id: 'chunk-empty',
          deckId: 'deck-1',
          title: 'empty',
          position: 2,
          reviewState: null,
          chunkCards: [],
        },
      ]);

      await expect(service.getEligibleQueueItems(now)).resolves.toEqual([]);
    });

    it('treats chunks without persisted state as immediately due and sorts deterministically', async () => {
      const now = new Date('2026-04-02T09:00:00.000Z');

      prisma.chunk.findMany.mockResolvedValue([
        {
          id: 'chunk-2',
          deckId: 'deck-1',
          title: 'second',
          position: 1,
          reviewState: null,
          chunkCards: [
            {
              cardId: 'card-b',
              sequenceIndex: 0,
              card: {
                id: 'card-b',
                kind: 'basic',
                fields: { front: 'b', back: 'b' },
                createdAt: new Date('2026-04-01T11:00:00.000Z'),
              },
            },
          ],
        },
        {
          id: 'chunk-1',
          deckId: 'deck-1',
          title: 'first',
          position: 0,
          reviewState: null,
          chunkCards: [
            {
              cardId: 'card-a',
              sequenceIndex: 0,
              card: {
                id: 'card-a',
                kind: 'basic',
                fields: { front: 'a', back: 'a' },
                createdAt: new Date('2026-04-01T10:00:00.000Z'),
              },
            },
          ],
        },
      ]);

      await expect(service.getEligibleQueueItems(now)).resolves.toEqual([
        expect.objectContaining({
          cardId: 'card-a',
          chunkId: 'chunk-1',
        }),
        expect.objectContaining({
          cardId: 'card-b',
          chunkId: 'chunk-2',
        }),
      ]);
    });
  });

  describe('applyGradeToCard', () => {
    it('advances chunk progress and logs a successful review', async () => {
      const now = new Date('2026-04-02T09:00:00.000Z');

      prisma.chunk.findFirst.mockResolvedValue({
        id: 'chunk-1',
        deckId: 'deck-1',
        title: 'spielen',
        position: 0,
        reviewState: {
          id: 'state-1',
          chunkId: 'chunk-1',
          due: new Date('2026-04-02T08:00:00.000Z'),
          consecutiveSuccessCount: 0,
          lastGrade: null,
          createdAt: now,
          updatedAt: now,
        },
        chunkCards: [
          {
            cardId: 'card-1',
            sequenceIndex: 0,
            card: {
              id: 'card-1',
              kind: 'basic',
              fields: { front: 'spielen 1', back: 'play 1' },
              createdAt: new Date('2026-04-01T10:00:00.000Z'),
            },
          },
          {
            cardId: 'card-2',
            sequenceIndex: 1,
            card: {
              id: 'card-2',
              kind: 'basic',
              fields: { front: 'spielen 2', back: 'play 2' },
              createdAt: new Date('2026-04-01T11:00:00.000Z'),
            },
          },
        ],
      });
      prisma.chunkReviewState.upsert.mockResolvedValue({
        id: 'state-1',
        chunkId: 'chunk-1',
        due: new Date('2026-04-02T08:00:00.000Z'),
        consecutiveSuccessCount: 0,
        lastGrade: null,
        createdAt: now,
        updatedAt: now,
      });
      prisma.reviewState.findUnique.mockResolvedValue({
        id: 'card-state-1',
        cardId: 'card-1',
        ease: 2.5,
        interval: 0,
        due: new Date('2026-04-02T08:00:00.000Z'),
        reps: 0,
        lapses: 0,
        lastGrade: null,
      });

      const successfulResult = await service.applyGradeToCard(
        'card-1',
        'good',
        now,
      );

      expect(successfulResult).not.toBeNull();
      expect(successfulResult).toEqual(
        expect.objectContaining({
          cardId: 'card-1',
          grade: 'good',
          wasSuccessful: true,
          advanced: true,
          reset: false,
          previousConsecutiveSuccessCount: 0,
          consecutiveSuccessCount: 1,
          intervalHours: 8,
          due: new Date('2026-04-02T17:00:00.000Z'),
        }),
      );
      expect(
        (successfulResult as GradeChunkReviewResult).nextActionableItem,
      ).toEqual(
        expect.objectContaining({
          cardId: 'card-2',
          positionInChunk: 1,
          consecutiveSuccessCount: 1,
        }),
      );

      expect(prisma.chunkReviewState.update).toHaveBeenCalledWith({
        where: { chunkId: 'chunk-1' },
        data: {
          due: new Date('2026-04-02T17:00:00.000Z'),
          consecutiveSuccessCount: 1,
          lastGrade: 'good',
        },
      });
      expect(prisma.reviewState.upsert).toHaveBeenCalledWith({
        where: { cardId: 'card-1' },
        update: {
          due: new Date('2026-04-02T17:00:00.000Z'),
          interval: 8,
          reps: 1,
          lapses: 0,
          lastGrade: 'good',
        },
        create: {
          cardId: 'card-1',
          ease: 2.5,
          interval: 8,
          due: new Date('2026-04-02T17:00:00.000Z'),
          reps: 1,
          lapses: 0,
          lastGrade: 'good',
        },
      });
      expect(prisma.reviewLog.create).toHaveBeenCalledTimes(1);
      expect(prisma.$transaction).toHaveBeenCalledTimes(1);
      const [successfulLogCall] = prisma.reviewLog.create.mock.calls as Array<
        [
          {
            data: {
              cardId: string;
              grade: Grade;
              oldInterval: number;
              newInterval: number;
              oldEase: number;
              newEase: number;
              mode: string;
              wasCorrect: boolean | null;
            };
          },
        ]
      >;
      const successfulLogPayload = successfulLogCall?.[0] as {
        data: {
          cardId: string;
          grade: Grade;
          oldInterval: number;
          newInterval: number;
          oldEase: number;
          newEase: number;
          mode: string;
          wasCorrect: boolean | null;
        };
      };
      expect(successfulLogPayload.data).toEqual(
        expect.objectContaining({
          cardId: 'card-1',
          grade: 'good',
          oldInterval: 0,
          newInterval: 8,
          oldEase: 2.5,
          newEase: 2.5,
          mode: 'basic',
          wasCorrect: true,
        }),
      );
    });

    it('resets chunk progress on again and schedules from the first interval', async () => {
      const now = new Date('2026-04-02T09:00:00.000Z');

      prisma.chunk.findFirst.mockResolvedValue({
        id: 'chunk-1',
        deckId: 'deck-1',
        title: 'spielen',
        position: 0,
        reviewState: {
          id: 'state-1',
          chunkId: 'chunk-1',
          due: new Date('2026-04-02T08:00:00.000Z'),
          consecutiveSuccessCount: 3,
          lastGrade: 'good',
          createdAt: now,
          updatedAt: now,
        },
        chunkCards: [
          {
            cardId: 'card-1',
            sequenceIndex: 0,
            card: {
              id: 'card-1',
              kind: 'basic',
              fields: { front: 'spielen 1', back: 'play 1' },
              createdAt: new Date('2026-04-01T10:00:00.000Z'),
            },
          },
          {
            cardId: 'card-2',
            sequenceIndex: 1,
            card: {
              id: 'card-2',
              kind: 'basic',
              fields: { front: 'spielen 2', back: 'play 2' },
              createdAt: new Date('2026-04-01T11:00:00.000Z'),
            },
          },
          {
            cardId: 'card-3',
            sequenceIndex: 2,
            card: {
              id: 'card-3',
              kind: 'basic',
              fields: { front: 'spielen 3', back: 'play 3' },
              createdAt: new Date('2026-04-01T12:00:00.000Z'),
            },
          },
          {
            cardId: 'card-4',
            sequenceIndex: 3,
            card: {
              id: 'card-4',
              kind: 'basic',
              fields: { front: 'spielen 4', back: 'play 4' },
              createdAt: new Date('2026-04-01T13:00:00.000Z'),
            },
          },
        ],
      });
      prisma.chunkReviewState.upsert.mockResolvedValue({
        id: 'state-1',
        chunkId: 'chunk-1',
        due: new Date('2026-04-02T08:00:00.000Z'),
        consecutiveSuccessCount: 3,
        lastGrade: 'good',
        createdAt: now,
        updatedAt: now,
      });
      prisma.reviewState.findUnique.mockResolvedValue(null);

      const resetResult = await service.applyGradeToCard(
        'card-4',
        'again',
        now,
      );

      expect(resetResult).not.toBeNull();
      expect(resetResult).toEqual(
        expect.objectContaining({
          wasSuccessful: false,
          advanced: false,
          reset: true,
          previousConsecutiveSuccessCount: 3,
          consecutiveSuccessCount: 0,
          intervalHours: 4,
          due: new Date('2026-04-02T13:00:00.000Z'),
        }),
      );
      expect(
        (resetResult as GradeChunkReviewResult).nextActionableItem,
      ).toEqual(
        expect.objectContaining({
          cardId: 'card-1',
          positionInChunk: 0,
          consecutiveSuccessCount: 0,
        }),
      );

      expect(prisma.reviewState.upsert).toHaveBeenCalledWith({
        where: { cardId: 'card-4' },
        update: {
          due: new Date('2026-04-02T13:00:00.000Z'),
          interval: 4,
          reps: 0,
          lapses: 1,
          lastGrade: 'again',
        },
        create: {
          cardId: 'card-4',
          ease: 2.5,
          interval: 4,
          due: new Date('2026-04-02T13:00:00.000Z'),
          reps: 0,
          lapses: 1,
          lastGrade: 'again',
        },
      });
      expect(prisma.reviewLog.create).toHaveBeenCalledTimes(1);
      expect(prisma.$transaction).toHaveBeenCalledTimes(1);
      const [resetLogCall] = prisma.reviewLog.create.mock.calls as Array<
        [
          {
            data: {
              cardId: string;
              grade: Grade;
              newInterval: number;
              wasCorrect: boolean | null;
            };
          },
        ]
      >;
      const resetLogPayload = resetLogCall?.[0] as {
        data: {
          cardId: string;
          grade: Grade;
          newInterval: number;
          wasCorrect: boolean | null;
        };
      };
      expect(resetLogPayload.data).toEqual(
        expect.objectContaining({
          cardId: 'card-4',
          grade: 'again',
          newInterval: 4,
          wasCorrect: false,
        }),
      );
    });

    it('returns null when the graded card is not the current due chunk card', async () => {
      const now = new Date('2026-04-02T09:00:00.000Z');

      prisma.chunk.findFirst.mockResolvedValue({
        id: 'chunk-1',
        deckId: 'deck-1',
        title: 'spielen',
        position: 0,
        reviewState: {
          id: 'state-1',
          chunkId: 'chunk-1',
          due: new Date('2026-04-03T08:00:00.000Z'),
          consecutiveSuccessCount: 0,
          lastGrade: null,
          createdAt: now,
          updatedAt: now,
        },
        chunkCards: [
          {
            cardId: 'card-1',
            sequenceIndex: 0,
            card: {
              id: 'card-1',
              kind: 'basic',
              fields: { front: 'spielen 1', back: 'play 1' },
              createdAt: new Date('2026-04-01T10:00:00.000Z'),
            },
          },
        ],
      });
      prisma.chunkReviewState.upsert.mockResolvedValue({
        id: 'state-1',
        chunkId: 'chunk-1',
        due: new Date('2026-04-03T08:00:00.000Z'),
        consecutiveSuccessCount: 0,
        lastGrade: null,
        createdAt: now,
        updatedAt: now,
      });

      await expect(
        service.applyGradeToCard('card-1', 'good', now),
      ).resolves.toBeNull();

      expect(prisma.chunkReviewState.update).not.toHaveBeenCalled();
      expect(prisma.reviewState.upsert).not.toHaveBeenCalled();
      expect(prisma.reviewLog.create).not.toHaveBeenCalled();
    });
  });
});

import type { Grade } from '@prisma/client';
import type { PrismaService } from '../../prisma/prisma.service';
import { ReviewsService } from './reviews.service';

function createPrismaMock() {
  return {
    chunk: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
    },
    chunkReviewState: {
      upsert: jest.fn(),
    },
  };
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
        stateCreatedAt: now,
        stateUpdatedAt: now,
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
});

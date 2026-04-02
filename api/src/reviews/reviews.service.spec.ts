import type { Grade } from '@prisma/client';
import type { PrismaService } from '../../prisma/prisma.service';
import { ReviewsService } from './reviews.service';

function createPrismaMock() {
  return {
    chunk: {
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
});

import type { Grade } from '@prisma/client';
import type { PrismaService } from '../../prisma/prisma.service';
import type { GradeChunkReviewResult } from './reviews.service';
import { REVIEW_KIND_UNSUPPORTED_REASONS } from './review-kind-adapter';
import * as reviewObservability from './review-observability';
import { ReviewsService } from './reviews.service';

function createPrismaMock() {
  const prisma = {
    deck: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
    },
    deckShare: {
      findMany: jest.fn(),
    },
    deckCard: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
    },
    chunk: {
      findFirst: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
    },
    card: {
      findFirst: jest.fn(),
      findMany: jest.fn(),
    },
    chunkReviewState: {
      upsert: jest.fn(),
      update: jest.fn(),
    },
    reviewState: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
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
    prisma.deck.findMany.mockResolvedValue([
      { id: 'deck-1' },
      { id: 'deck-2' },
    ]);
    prisma.deck.findUnique.mockResolvedValue(null);
    prisma.deckShare.findMany.mockResolvedValue([]);
    prisma.deckCard.findMany.mockResolvedValue([]);
    prisma.deckCard.findFirst.mockResolvedValue(null);
    prisma.card.findFirst.mockResolvedValue(null);
    prisma.card.findMany.mockResolvedValue([]);
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
    it('does not fail queue retrieval when observability emission throws', async () => {
      const now = new Date('2026-04-02T09:00:00.000Z');
      const emitSpy = jest
        .spyOn(reviewObservability, 'emitReviewQueueFetched')
        .mockImplementation(() => {
          throw new Error('observability_failed');
        });

      prisma.chunk.findMany.mockResolvedValue([
        {
          id: 'chunk-1',
          deckId: 'deck-1',
          title: 'spielen',
          position: 0,
          reviewState: null,
          chunkCards: [
            {
              cardId: 'card-1',
              sequenceIndex: 0,
              card: {
                id: 'card-1',
                kind: 'basic',
                fields: { front: 'spielen', back: 'play' },
                createdAt: new Date('2026-04-01T10:00:00.000Z'),
              },
            },
          ],
        },
      ]);

      try {
        await expect(
          service.getEligibleQueueItems('user-1', now),
        ).resolves.toEqual([
          expect.objectContaining({
            cardId: 'card-1',
            chunkId: 'chunk-1',
            isReviewSupported: true,
            reviewUnsupportedReason: null,
          }),
        ]);
      } finally {
        emitSpy.mockRestore();
      }
    });

    it('preloads due chunk cards in review order for fast local advance', async () => {
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

      await expect(
        service.getEligibleQueueItems('user-1', now),
      ).resolves.toEqual([
        expect.objectContaining({
          cardId: 'card-3',
          chunkId: 'chunk-2',
          positionInChunk: 0,
          isReviewSupported: true,
          reviewUnsupportedReason: null,
          consecutiveSuccessCount: 0,
        }),
        expect.objectContaining({
          cardId: 'card-2',
          chunkId: 'chunk-1',
          positionInChunk: 1,
          isReviewSupported: true,
          reviewUnsupportedReason: null,
          consecutiveSuccessCount: 1,
        }),
      ]);
    });

    it('scopes queue retrieval to the selected deck', async () => {
      const now = new Date('2026-04-02T09:00:00.000Z');

      prisma.chunk.findMany.mockResolvedValue([
        {
          id: 'chunk-deck-2',
          deckId: 'deck-2',
          title: 'deck 2 only',
          position: 0,
          reviewState: null,
          chunkCards: [
            {
              cardId: 'card-deck-2',
              sequenceIndex: 0,
              card: {
                id: 'card-deck-2',
                kind: 'basic',
                fields: { front: 'deck 2', back: 'only deck 2' },
                createdAt: new Date('2026-04-01T10:00:00.000Z'),
              },
            },
          ],
        },
      ]);

      await expect(
        service.getEligibleQueueItems('user-1', now, 'deck-2'),
      ).resolves.toEqual([
        expect.objectContaining({
          cardId: 'card-deck-2',
          deckId: 'deck-2',
        }),
      ]);
      expect(prisma.chunk.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { deckId: { in: ['deck-2'] } },
        }),
      );
    });

    it('rejects queue retrieval for inaccessible decks', async () => {
      prisma.deck.findMany.mockResolvedValue([{ id: 'deck-1' }]);

      await expect(
        service.getEligibleQueueItems(
          'user-1',
          new Date('2026-04-02T09:00:00.000Z'),
          'deck-2',
        ),
      ).rejects.toThrow('Review deck not found');
      expect(prisma.chunk.findMany).not.toHaveBeenCalled();
    });

    it('returns supported metadata for review-enabled cloze text cards', async () => {
      const now = new Date('2026-04-02T09:00:00.000Z');

      prisma.chunk.findMany.mockResolvedValue([
        {
          id: 'chunk-unsupported',
          deckId: 'deck-1',
          title: 'cloze chunk',
          position: 0,
          reviewState: null,
          chunkCards: [
            {
              cardId: 'card-cloze-1',
              sequenceIndex: 0,
              card: {
                id: 'card-cloze-1',
                kind: 'cloze_text',
                fields: {
                  text: 'Ich {{c1::spiele}} gern Tennis.',
                  answer: 'spiele',
                },
                createdAt: new Date('2026-04-01T09:00:00.000Z'),
              },
            },
          ],
        },
      ]);

      await expect(
        service.getEligibleQueueItems('user-1', now),
      ).resolves.toEqual([
        expect.objectContaining({
          cardId: 'card-cloze-1',
          kind: 'cloze_text',
          isReviewSupported: true,
          reviewUnsupportedReason: null,
        }),
      ]);
    });

    it('returns invalid-payload metadata for malformed cloze text fields', async () => {
      const now = new Date('2026-04-02T09:00:00.000Z');

      prisma.chunk.findMany.mockResolvedValue([
        {
          id: 'chunk-invalid-cloze',
          deckId: 'deck-1',
          title: 'invalid cloze payload',
          position: 0,
          reviewState: null,
          chunkCards: [
            {
              cardId: 'card-invalid-cloze-1',
              sequenceIndex: 0,
              card: {
                id: 'card-invalid-cloze-1',
                kind: 'cloze_text',
                fields: {
                  text: 'Ich {{c1::spiele}} gern Tennis.',
                  answer: 'lerne',
                },
                createdAt: new Date('2026-04-01T09:00:00.000Z'),
              },
            },
          ],
        },
      ]);

      await expect(
        service.getEligibleQueueItems('user-1', now),
      ).resolves.toEqual([
        expect.objectContaining({
          cardId: 'card-invalid-cloze-1',
          kind: 'cloze_text',
          isReviewSupported: false,
          reviewUnsupportedReason:
            REVIEW_KIND_UNSUPPORTED_REASONS.invalidPayload,
        }),
      ]);
    });

    it('returns invalid-payload metadata for malformed basic fields', async () => {
      const now = new Date('2026-04-02T09:00:00.000Z');

      prisma.chunk.findMany.mockResolvedValue([
        {
          id: 'chunk-invalid-payload',
          deckId: 'deck-1',
          title: 'invalid basic payload',
          position: 0,
          reviewState: null,
          chunkCards: [
            {
              cardId: 'card-invalid-1',
              sequenceIndex: 0,
              card: {
                id: 'card-invalid-1',
                kind: 'basic',
                fields: {
                  front: 'only front present',
                },
                createdAt: new Date('2026-04-01T09:00:00.000Z'),
              },
            },
          ],
        },
      ]);

      await expect(
        service.getEligibleQueueItems('user-1', now),
      ).resolves.toEqual([
        expect.objectContaining({
          cardId: 'card-invalid-1',
          kind: 'basic',
          isReviewSupported: false,
          reviewUnsupportedReason:
            REVIEW_KIND_UNSUPPORTED_REASONS.invalidPayload,
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

      await expect(
        service.getEligibleQueueItems('user-1', now),
      ).resolves.toEqual([]);
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

      await expect(
        service.getEligibleQueueItems('user-1', now),
      ).resolves.toEqual([
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

    it('places immediate retry items behind other due cards when due times match', async () => {
      const now = new Date('2026-04-02T09:00:00.000Z');

      prisma.chunk.findMany.mockResolvedValue([
        {
          id: 'chunk-retry',
          deckId: 'deck-1',
          title: 'retry',
          position: 0,
          reviewState: {
            id: 'state-retry',
            chunkId: 'chunk-retry',
            due: now,
            consecutiveSuccessCount: 0,
            lastGrade: 'again' satisfies Grade,
            createdAt: now,
            updatedAt: now,
          },
          chunkCards: [
            {
              cardId: 'card-retry',
              sequenceIndex: 0,
              card: {
                id: 'card-retry',
                kind: 'basic',
                fields: { front: 'retry', back: 'retry' },
                createdAt: new Date('2026-04-01T09:00:00.000Z'),
              },
            },
          ],
        },
        {
          id: 'chunk-fresh',
          deckId: 'deck-1',
          title: 'fresh',
          position: 1,
          reviewState: null,
          chunkCards: [
            {
              cardId: 'card-fresh',
              sequenceIndex: 0,
              card: {
                id: 'card-fresh',
                kind: 'basic',
                fields: { front: 'fresh', back: 'fresh' },
                createdAt: new Date('2026-04-01T10:00:00.000Z'),
              },
            },
          ],
        },
      ]);

      await expect(
        service.getEligibleQueueItems('user-1', now),
      ).resolves.toEqual([
        expect.objectContaining({ cardId: 'card-fresh' }),
        expect.objectContaining({ cardId: 'card-retry' }),
      ]);
    });

    it('gracefully handles malformed persisted chunk review state rows', async () => {
      const now = new Date('2026-04-02T09:00:00.000Z');

      prisma.chunk.findMany.mockResolvedValue([
        {
          id: 'chunk-broken-state',
          deckId: 'deck-1',
          title: 'broken-state',
          position: 0,
          reviewState: {
            id: 'state-broken',
            chunkId: 'chunk-broken-state',
            due: null,
            consecutiveSuccessCount: null,
            lastGrade: 'not_a_grade',
            createdAt: now,
            updatedAt: now,
          } as unknown,
          chunkCards: [
            {
              cardId: 'card-safe-1',
              sequenceIndex: 0,
              card: {
                id: 'card-safe-1',
                kind: 'basic',
                fields: { front: 'safe', back: 'safe' },
                createdAt: new Date('2026-04-01T09:00:00.000Z'),
              },
            },
          ],
        },
      ]);

      await expect(
        service.getEligibleQueueItems('user-1', now),
      ).resolves.toEqual([
        expect.objectContaining({
          chunkId: 'chunk-broken-state',
          cardId: 'card-safe-1',
          due: now,
          consecutiveSuccessCount: 0,
          isReviewSupported: true,
          reviewUnsupportedReason: null,
        }),
      ]);
    });
  });

  describe('getPracticeItems', () => {
    it('returns every card in the selected deck without mutating review state', async () => {
      const now = new Date('2026-04-02T09:00:00.000Z');

      prisma.chunk.findMany.mockResolvedValue([
        {
          id: 'chunk-practice',
          deckId: 'deck-1',
          title: 'practice chunk',
          position: 0,
          reviewState: {
            id: 'state-practice',
            chunkId: 'chunk-practice',
            due: new Date('2026-04-05T09:00:00.000Z'),
            consecutiveSuccessCount: 4,
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
                fields: { front: 'eins', back: 'one' },
                createdAt: new Date('2026-04-01T10:00:00.000Z'),
              },
            },
            {
              cardId: 'card-2',
              sequenceIndex: 1,
              card: {
                id: 'card-2',
                kind: 'basic',
                fields: { front: 'zwei', back: 'two' },
                createdAt: new Date('2026-04-01T11:00:00.000Z'),
              },
            },
          ],
        },
      ]);

      await expect(
        service.getPracticeItems('user-1', 'deck-1'),
      ).resolves.toEqual([
        expect.objectContaining({
          cardId: 'card-1',
          deckId: 'deck-1',
          isReviewSupported: true,
        }),
        expect.objectContaining({
          cardId: 'card-2',
          deckId: 'deck-1',
          isReviewSupported: true,
        }),
      ]);
      expect(prisma.chunk.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { deckId: { in: ['deck-1'] } },
        }),
      );
      expect(prisma.chunkReviewState.upsert).not.toHaveBeenCalled();
      expect(prisma.chunkReviewState.update).not.toHaveBeenCalled();
      expect(prisma.reviewState.upsert).not.toHaveBeenCalled();
      expect(prisma.reviewLog.create).not.toHaveBeenCalled();
    });
  });

  describe('getWhatDidYouHearQuizRound', () => {
    it('returns a ready round from the due review queue and deck image-audio pool', async () => {
      const now = new Date('2026-04-02T09:00:00.000Z');

      prisma.deck.findUnique.mockResolvedValue({
        exerciseSettings: {
          whatDidYouHear: {
            choiceCount: 4,
          },
        },
        deckCards: [
          {
            card: {
              id: 'card-1',
              kind: 'image_audio',
              fields: {
                label: 'Car',
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
              },
            },
          },
          {
            card: {
              id: 'card-2',
              kind: 'image_audio',
              fields: {
                label: 'Bus',
                imageAsset: {
                  path: 'kids-images/user-1/bus.jpg',
                  mimeType: 'image/jpeg',
                  size: 100,
                },
                audioAsset: {
                  path: 'kids-audio/user-1/bus.mp3',
                  mimeType: 'audio/mpeg',
                  size: 100,
                },
              },
            },
          },
        ],
      });
      prisma.chunk.findMany.mockResolvedValue([
        {
          id: 'chunk-1',
          deckId: 'deck-1',
          title: 'vehicles',
          position: 0,
          deck: { reviewIntervalHours: [1, 24] },
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
                kind: 'image_audio',
                fields: {
                  label: 'Car',
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
                },
                createdAt: new Date('2026-04-01T10:00:00.000Z'),
              },
            },
          ],
        },
      ]);

      const result = await service.getWhatDidYouHearQuizRound(
        'user-1',
        'deck-1',
        now,
        () => 0,
      );

      expect(result.status).toBe('ready');
      if (result.status !== 'ready') {
        throw new Error('Expected a ready What Did You Hear? round');
      }

      expect(result.round.deckId).toBe('deck-1');
      expect(result.round.choiceCount).toBe(4);
      expect(result.round.eligibleCardCount).toBe(2);
      expect(result.round.targetCard.cardId).toBe('card-1');
      expect(result.round.targetCard.label).toBe('Car');
      expect(result.round.targetQueueItem.cardId).toBe('card-1');
      expect(result.round.targetQueueItem.deckId).toBe('deck-1');
      expect(result.round.targetQueueItem.chunkId).toBe('chunk-1');
      expect(result.round.choices).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            cardId: 'card-1',
            isCorrect: true,
            isDisabled: false,
          }),
          expect.objectContaining({
            cardId: 'card-2',
            isCorrect: false,
            isDisabled: false,
          }),
          expect.objectContaining({
            cardId: null,
            isDisabled: true,
          }),
          expect.objectContaining({
            cardId: null,
            isDisabled: true,
          }),
        ]),
      );
    });

    it('returns not_enough_eligible_cards when the deck cannot fill the minimum quiz pool', async () => {
      prisma.deck.findUnique.mockResolvedValue({
        exerciseSettings: {
          whatDidYouHear: {
            choiceCount: 4,
          },
        },
        deckCards: [
          {
            card: {
              id: 'card-1',
              kind: 'image_audio',
              fields: {
                label: 'Car',
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
              },
            },
          },
        ],
      });
      prisma.chunk.findMany.mockResolvedValue([]);

      await expect(
        service.getWhatDidYouHearQuizRound('user-1', 'deck-1'),
      ).resolves.toEqual({
        status: 'not_enough_eligible_cards',
        eligibleCardCount: 1,
        minimumEligibleCardCount: 2,
        choiceCount: 4,
      });
    });
  });

  describe('submitWhatDidYouHearQuizResult', () => {
    it('derives the review grade, applies scheduling, and returns the next quiz state', async () => {
      const now = new Date('2026-04-02T09:00:00.000Z');
      const existingDue = new Date('2026-04-02T08:00:00.000Z');

      prisma.deckCard.findFirst
        .mockResolvedValueOnce({
          card: {
            id: 'card-1',
            fields: {
              label: 'Car',
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
            },
          },
        })
        .mockResolvedValueOnce({
          deckId: 'deck-1',
          deck: { reviewIntervalHours: [1, 8] },
          card: {
            id: 'card-1',
            kind: 'image_audio',
            fields: {
              label: 'Car',
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
            },
            createdAt: new Date('2026-04-01T10:00:00.000Z'),
            state: {
              due: existingDue,
              ease: 2.5,
              interval: 1,
              reps: 0,
              lapses: 0,
              consecutiveSuccessCount: 0,
              lastGrade: null,
            },
          },
        });
      prisma.deck.findUnique.mockResolvedValue({
        exerciseSettings: {
          whatDidYouHear: {
            choiceCount: 4,
          },
        },
        deckCards: [
          {
            card: {
              id: 'card-1',
              kind: 'image_audio',
              fields: {
                label: 'Car',
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
              },
            },
          },
          {
            card: {
              id: 'card-2',
              kind: 'image_audio',
              fields: {
                label: 'Bus',
                imageAsset: {
                  path: 'kids-images/user-1/bus.jpg',
                  mimeType: 'image/jpeg',
                  size: 100,
                },
                audioAsset: {
                  path: 'kids-audio/user-1/bus.mp3',
                  mimeType: 'audio/mpeg',
                  size: 100,
                },
              },
            },
          },
        ],
      });
      prisma.chunk.findMany.mockResolvedValue([]);
      prisma.deckCard.findMany.mockResolvedValue([]);
      prisma.reviewState.update.mockResolvedValue(undefined);
      prisma.reviewLog.create.mockResolvedValue(undefined);

      const result = await service.submitWhatDidYouHearQuizResult(
        'user-1',
        'deck-1',
        'card-1',
        1,
        now,
      );

      expect(result.accepted).toBe(true);
      expect(result.cardId).toBe('card-1');
      expect(result.wrongAttemptCount).toBe(1);
      expect(result.derivedReviewGrade).toBe('hard');
      expect(result.review).toEqual(
        expect.objectContaining({
          cardId: 'card-1',
          grade: 'hard',
          wasSuccessful: false,
          intervalHours: 4,
        }),
      );
      expect(result.nextQuizRound).toEqual({
        status: 'no_due_target',
        eligibleCardCount: 2,
        choiceCount: 4,
      });
      expect(prisma.reviewLog.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          cardId: 'card-1',
          grade: 'hard',
          mode: 'what_did_you_hear',
          wasCorrect: false,
        }),
      });
    });

    it('rejects cards that are not eligible image-audio quiz targets', async () => {
      prisma.deckCard.findFirst.mockResolvedValueOnce({
        card: {
          id: 'card-1',
          fields: { front: 'Hello', back: 'Hallo' },
        },
      });

      await expect(
        service.submitWhatDidYouHearQuizResult(
          'user-1',
          'deck-1',
          'card-1',
          0,
        ),
      ).rejects.toThrow('Card is not eligible for What Did You Hear?');
      expect(prisma.reviewLog.create).not.toHaveBeenCalled();
    });
  });

  describe('applyGradeToCard', () => {
    it('advances chunk progress and logs a successful review', async () => {
      const now = new Date('2026-04-02T09:00:00.000Z');

      prisma.chunk.findMany.mockResolvedValue([
        {
          id: 'chunk-1',
          deckId: 'deck-1',
          title: 'spielen',
          position: 0,
          deck: { reviewIntervalHours: [1, 2, 3] },
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
        },
      ]);
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
        'user-1',
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
          intervalHours: 2,
          due: new Date('2026-04-02T11:00:00.000Z'),
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
          due: new Date('2026-04-02T11:00:00.000Z'),
          consecutiveSuccessCount: 1,
          lastGrade: 'good',
        },
      });
      expect(prisma.reviewState.upsert).toHaveBeenCalledWith({
        where: { cardId: 'card-1' },
        update: {
          due: new Date('2026-04-02T11:00:00.000Z'),
          interval: 2,
          consecutiveSuccessCount: 1,
          reps: 1,
          lapses: 0,
          lastGrade: 'good',
        },
        create: {
          cardId: 'card-1',
          ease: 2.5,
          interval: 2,
          due: new Date('2026-04-02T11:00:00.000Z'),
          consecutiveSuccessCount: 1,
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
          newInterval: 2,
          oldEase: 2.5,
          newEase: 2.5,
          mode: 'basic',
          wasCorrect: true,
        }),
      );
    });

    it('resets chunk progress on again and retries immediately', async () => {
      const now = new Date('2026-04-02T09:00:00.000Z');

      prisma.chunk.findMany.mockResolvedValue([
        {
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
        },
      ]);
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
        'user-1',
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
          intervalHours: 0,
          due: now,
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
          due: now,
          interval: 0,
          consecutiveSuccessCount: 0,
          reps: 0,
          lapses: 1,
          lastGrade: 'again',
        },
        create: {
          cardId: 'card-4',
          ease: 2.5,
          interval: 0,
          due: now,
          consecutiveSuccessCount: 0,
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
          newInterval: 0,
          wasCorrect: false,
        }),
      );
    });

    it('uses the reviewable chunk when a card belongs to multiple chunks', async () => {
      const now = new Date('2026-04-02T09:00:00.000Z');

      prisma.chunk.findMany.mockResolvedValue([
        {
          id: 'chunk-not-current',
          deckId: 'deck-1',
          title: 'Deck Inbox',
          position: 0,
          reviewState: {
            id: 'state-1',
            chunkId: 'chunk-not-current',
            due: new Date('2026-04-02T08:00:00.000Z'),
            consecutiveSuccessCount: 0,
            lastGrade: null,
            createdAt: now,
            updatedAt: now,
          },
          chunkCards: [
            {
              cardId: 'card-other',
              sequenceIndex: 0,
              card: {
                id: 'card-other',
                kind: 'basic',
                fields: { front: 'other', back: 'other' },
                createdAt: new Date('2026-04-01T09:00:00.000Z'),
              },
            },
            {
              cardId: 'card-1',
              sequenceIndex: 1,
              card: {
                id: 'card-1',
                kind: 'basic',
                fields: { front: 'spielen', back: 'play' },
                createdAt: new Date('2026-04-01T10:00:00.000Z'),
              },
            },
          ],
        },
        {
          id: 'chunk-reviewable',
          deckId: 'deck-1',
          title: 'spielen',
          position: 1,
          reviewState: {
            id: 'state-2',
            chunkId: 'chunk-reviewable',
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
                fields: { front: 'spielen', back: 'play' },
                createdAt: new Date('2026-04-01T10:00:00.000Z'),
              },
            },
          ],
        },
      ]);
      prisma.chunkReviewState.upsert
        .mockResolvedValueOnce({
          id: 'state-1',
          chunkId: 'chunk-not-current',
          due: new Date('2026-04-02T08:00:00.000Z'),
          consecutiveSuccessCount: 0,
          lastGrade: null,
          createdAt: now,
          updatedAt: now,
        })
        .mockResolvedValueOnce({
          id: 'state-2',
          chunkId: 'chunk-reviewable',
          due: new Date('2026-04-02T08:00:00.000Z'),
          consecutiveSuccessCount: 0,
          lastGrade: null,
          createdAt: now,
          updatedAt: now,
        });
      prisma.reviewState.findUnique.mockResolvedValue(null);

      const result = await service.applyGradeToCard(
        'card-1',
        'hard',
        'user-1',
        now,
      );

      expect(result).toEqual(
        expect.objectContaining({
          cardId: 'card-1',
          grade: 'hard',
          wasSuccessful: false,
          intervalHours: 4,
          due: new Date('2026-04-02T13:00:00.000Z'),
        }),
      );
      expect(prisma.chunkReviewState.update).toHaveBeenCalledWith({
        where: { chunkId: 'chunk-reviewable' },
        data: {
          due: new Date('2026-04-02T13:00:00.000Z'),
          consecutiveSuccessCount: 0,
          lastGrade: 'hard',
        },
      });
    });

    it('schedules hard with half the good interval and resets consecutive success count', async () => {
      const now = new Date('2026-04-02T09:00:00.000Z');

      prisma.chunk.findMany
        .mockResolvedValueOnce([
        {
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
                fields: { front: 'one', back: 'one' },
                createdAt: new Date('2026-04-01T10:00:00.000Z'),
              },
            },
            {
              cardId: 'card-2',
              sequenceIndex: 1,
              card: {
                id: 'card-2',
                kind: 'basic',
                fields: { front: 'two', back: 'two' },
                createdAt: new Date('2026-04-01T11:00:00.000Z'),
              },
            },
            {
              cardId: 'card-3',
              sequenceIndex: 2,
              card: {
                id: 'card-3',
                kind: 'basic',
                fields: { front: 'three', back: 'three' },
                createdAt: new Date('2026-04-01T12:00:00.000Z'),
              },
            },
          ],
        },
        ])
        .mockResolvedValue([]);
      prisma.chunkReviewState.upsert.mockResolvedValue({
        id: 'state-1',
        chunkId: 'chunk-1',
        due: new Date('2026-04-02T08:00:00.000Z'),
        consecutiveSuccessCount: 0,
        lastGrade: null,
        createdAt: now,
        updatedAt: now,
      });
      prisma.reviewState.findUnique.mockResolvedValue(null);

      // good would give DEFAULT[1]=8h; hard gives Math.round(8*0.5)=4h
      const result = await service.applyGradeToCard(
        'card-1',
        'hard',
        'user-1',
        now,
      );

      expect(result).toEqual(
        expect.objectContaining({
          cardId: 'card-1',
          grade: 'hard',
          wasSuccessful: false,
          intervalHours: 4,
          due: new Date('2026-04-02T13:00:00.000Z'),
          consecutiveSuccessCount: 0,
        }),
      );
      expect(result?.nextActionableItem).toBeNull();
      expect(prisma.chunkReviewState.update).toHaveBeenCalledWith({
        where: { chunkId: 'chunk-1' },
        data: {
          due: new Date('2026-04-02T13:00:00.000Z'),
          consecutiveSuccessCount: 0,
          lastGrade: 'hard',
        },
      });
      expect(prisma.reviewState.upsert).toHaveBeenCalledWith({
        where: { cardId: 'card-1' },
        update: {
          due: new Date('2026-04-02T13:00:00.000Z'),
          interval: 4,
          consecutiveSuccessCount: 0,
          reps: 0,
          lapses: 1,
          lastGrade: 'hard',
        },
        create: {
          cardId: 'card-1',
          ease: 2.5,
          interval: 4,
          due: new Date('2026-04-02T13:00:00.000Z'),
          consecutiveSuccessCount: 0,
          reps: 0,
          lapses: 1,
          lastGrade: 'hard',
        },
      });
    });

    it('falls back to the next due queue item when the graded chunk has no next card', async () => {
      const now = new Date('2026-04-02T09:00:00.000Z');

      prisma.chunk.findMany
        .mockResolvedValueOnce([
          {
            id: 'single-card-chunk',
            deckId: 'deck-1',
            title: 'spielen',
            position: 0,
            reviewState: {
              id: 'state-1',
              chunkId: 'single-card-chunk',
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
                  fields: { front: 'spielen', back: 'play' },
                  createdAt: new Date('2026-04-01T10:00:00.000Z'),
                },
              },
            ],
          },
        ])
        .mockResolvedValueOnce([
          {
            id: 'next-due-chunk',
            deckId: 'deck-1',
            title: 'machen',
            position: 1,
            reviewState: {
              id: 'state-2',
              chunkId: 'next-due-chunk',
              due: new Date('2026-04-02T08:30:00.000Z'),
              consecutiveSuccessCount: 0,
              lastGrade: null,
              createdAt: now,
              updatedAt: now,
            },
            chunkCards: [
              {
                cardId: 'card-2',
                sequenceIndex: 0,
                card: {
                  id: 'card-2',
                  kind: 'basic',
                  fields: { front: 'machen', back: 'make' },
                  createdAt: new Date('2026-04-01T11:00:00.000Z'),
                },
              },
            ],
          },
        ]);
      prisma.chunkReviewState.upsert.mockResolvedValue({
        id: 'state-1',
        chunkId: 'single-card-chunk',
        due: new Date('2026-04-02T08:00:00.000Z'),
        consecutiveSuccessCount: 0,
        lastGrade: null,
        createdAt: now,
        updatedAt: now,
      });
      prisma.reviewState.findUnique.mockResolvedValue(null);

      const result = await service.applyGradeToCard(
        'card-1',
        'good',
        'user-1',
        now,
      );

      expect(result?.nextActionableItem).toEqual(
        expect.objectContaining({
          cardId: 'card-2',
          chunkId: 'next-due-chunk',
          kind: 'basic',
        }),
      );
    });

    it('returns null when the graded card is not the current due chunk card', async () => {
      const now = new Date('2026-04-02T09:00:00.000Z');

      prisma.chunk.findMany.mockResolvedValue([
        {
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
        },
      ]);
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
        service.applyGradeToCard('card-1', 'good', 'user-1', now),
      ).resolves.toBeNull();

      expect(prisma.chunkReviewState.update).not.toHaveBeenCalled();
      expect(prisma.reviewState.upsert).not.toHaveBeenCalled();
      expect(prisma.reviewLog.create).not.toHaveBeenCalled();
    });

    it('returns null when the current card kind is not review-enabled', async () => {
      const now = new Date('2026-04-02T09:00:00.000Z');

      prisma.chunk.findMany.mockResolvedValue([
        {
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
                kind: 'audio_gap',
                fields: {
                  prompt: 'Select the missing audio segment.',
                },
                createdAt: new Date('2026-04-01T10:00:00.000Z'),
              },
            },
          ],
        },
      ]);
      prisma.chunkReviewState.upsert.mockResolvedValue({
        id: 'state-1',
        chunkId: 'chunk-1',
        due: new Date('2026-04-02T08:00:00.000Z'),
        consecutiveSuccessCount: 0,
        lastGrade: null,
        createdAt: now,
        updatedAt: now,
      });

      await expect(
        service.applyGradeToCard('card-1', 'good', 'user-1', now),
      ).resolves.toBeNull();

      expect(prisma.chunkReviewState.update).not.toHaveBeenCalled();
      expect(prisma.reviewState.upsert).not.toHaveBeenCalled();
      expect(prisma.reviewLog.create).not.toHaveBeenCalled();
    });
  });
});

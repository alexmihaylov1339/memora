import type { PrismaService } from '../../prisma/prisma.service';
import {
  applyGradeToStandaloneCard,
  initStandaloneCardReviewState,
} from './standalone-card-review';

function createPrismaMock() {
  const prisma = {
    deck: {
      findMany: jest.fn(),
    },
    deckShare: {
      findMany: jest.fn(),
    },
    card: {
      findFirst: jest.fn(),
      findMany: jest.fn(),
    },
    chunk: {
      findMany: jest.fn(),
    },
    reviewState: {
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
  ): Promise<T> => callback(prisma);

  prisma.$transaction.mockImplementation(runInTransaction as never);

  return prisma;
}

function buildCard() {
  const now = new Date('2026-05-06T10:00:00.000Z');

  return {
    id: 'card-1',
    deckId: 'deck-1',
    kind: 'basic',
    fields: { front: 'front', back: 'back' },
    createdAt: new Date('2026-05-06T09:00:00.000Z'),
    deck: { reviewIntervalHours: [4, 8, 12, 24] },
    state: {
      due: now,
      ease: 2.5,
      interval: 0,
      reps: 0,
      lapses: 0,
      consecutiveSuccessCount: 0,
      lastGrade: null,
    },
  };
}

describe('standalone card review', () => {
  it('initializes standalone card review state as immediately due', async () => {
    const prisma = createPrismaMock();
    const now = new Date('2026-05-06T10:00:00.000Z');

    await initStandaloneCardReviewState(
      prisma as unknown as PrismaService,
      ['card-1'],
      now,
    );

    expect(prisma.reviewState.upsert).toHaveBeenCalledWith({
      where: { cardId: 'card-1' },
      update: {
        due: now,
        interval: 0,
        reps: 0,
        lapses: 0,
        consecutiveSuccessCount: 0,
        lastGrade: null,
      },
      create: {
        cardId: 'card-1',
        ease: 2.5,
        interval: 0,
        due: now,
        reps: 0,
        lapses: 0,
        consecutiveSuccessCount: 0,
        lastGrade: null,
      },
    });
  });

  it.each([
    ['hard', 4, 0, false],
    ['good', 8, 1, true],
    ['easy', 12, 1, true],
  ] as const)(
    'grades a standalone card as %s with the expected independent interval',
    async (grade, intervalHours, consecutiveSuccessCount, wasSuccessful) => {
      const prisma = createPrismaMock();
      const now = new Date('2026-05-06T10:00:00.000Z');
      const nextDue = new Date(
        now.getTime() + intervalHours * 60 * 60 * 1000,
      );

      prisma.deck.findMany.mockResolvedValue([{ id: 'deck-1' }]);
      prisma.deckShare.findMany.mockResolvedValue([]);
      prisma.card.findFirst.mockResolvedValue(buildCard());
      prisma.chunk.findMany.mockResolvedValue([]);
      prisma.card.findMany.mockResolvedValue([]);

      const result = await applyGradeToStandaloneCard({
        cardId: 'card-1',
        deckId: 'deck-1',
        grade,
        now,
        prisma: prisma as unknown as PrismaService,
        userId: 'user-1',
      });

      expect(result).toEqual(
        expect.objectContaining({
          cardId: 'card-1',
          grade,
          intervalHours,
          consecutiveSuccessCount,
          wasSuccessful,
          due: nextDue,
        }),
      );
      expect(prisma.reviewState.update).toHaveBeenCalledWith({
        where: { cardId: 'card-1' },
        data: expect.objectContaining({
          due: nextDue,
          interval: intervalHours,
          consecutiveSuccessCount,
          lastGrade: grade,
        }),
      });
    },
  );

  it('keeps a standalone again grade immediately retryable', async () => {
    const prisma = createPrismaMock();
    const now = new Date('2026-05-06T10:00:00.000Z');

    prisma.deck.findMany.mockResolvedValue([{ id: 'deck-1' }]);
    prisma.deckShare.findMany.mockResolvedValue([]);
    prisma.card.findFirst.mockResolvedValue(buildCard());
    prisma.chunk.findMany.mockResolvedValue([]);
    prisma.card.findMany.mockResolvedValue([
      {
        id: 'card-1',
        deckId: 'deck-1',
        kind: 'basic',
        fields: { front: 'front', back: 'back' },
        createdAt: new Date('2026-05-06T09:00:00.000Z'),
        state: {
          due: now,
          consecutiveSuccessCount: 0,
          lastGrade: 'again',
        },
      },
    ]);

    const result = await applyGradeToStandaloneCard({
      cardId: 'card-1',
      deckId: 'deck-1',
      grade: 'again',
      now,
      prisma: prisma as unknown as PrismaService,
      userId: 'user-1',
    });

    expect(result).toEqual(
      expect.objectContaining({
        cardId: 'card-1',
        grade: 'again',
        intervalHours: 0,
        nextActionableItem: expect.objectContaining({
          cardId: 'card-1',
        }),
      }),
    );
  });
});

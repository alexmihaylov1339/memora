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
    deckCard: {
      findFirst: jest.fn(),
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
      createMany: jest.fn(),
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

    expect(prisma.reviewState.createMany).toHaveBeenCalledWith({
      data: [
        {
          cardId: 'card-1',
          ease: 2.5,
          interval: 0,
          due: now,
          reps: 0,
          lapses: 0,
          consecutiveSuccessCount: 0,
          lastGrade: null,
        },
      ],
      skipDuplicates: true,
    });
  });

  it('initializes multiple standalone card review states in one batch', async () => {
    const prisma = createPrismaMock();

    await initStandaloneCardReviewState(prisma as unknown as PrismaService, [
      'card-1',
      'card-2',
      'card-3',
    ]);

    expect(prisma.reviewState.createMany).toHaveBeenCalledWith({
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      data: expect.arrayContaining([
        expect.objectContaining({ cardId: 'card-1' }),
        expect.objectContaining({ cardId: 'card-2' }),
        expect.objectContaining({ cardId: 'card-3' }),
      ]),
      skipDuplicates: true,
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
      const nextDue = new Date(now.getTime() + intervalHours * 60 * 60 * 1000);

      prisma.deck.findMany.mockResolvedValue([{ id: 'deck-1' }]);
      prisma.deckShare.findMany.mockResolvedValue([]);
      prisma.deckCard.findFirst.mockResolvedValue({
        deckId: 'deck-1',
        deck: { reviewIntervalHours: [4, 8, 12, 24] },
        card: buildCard(),
      });
      prisma.deckCard.findMany.mockResolvedValue([]);
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
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
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
    prisma.deckCard.findFirst.mockResolvedValue({
      deckId: 'deck-1',
      deck: { reviewIntervalHours: [4, 8, 12, 24] },
      card: buildCard(),
    });
    prisma.deckCard.findMany.mockResolvedValue([
      {
        deckId: 'deck-1',
        card: {
          id: 'card-1',
          kind: 'basic',
          fields: { front: 'front', back: 'back' },
          createdAt: new Date('2026-05-06T09:00:00.000Z'),
          state: {
            due: now,
            consecutiveSuccessCount: 0,
            lastGrade: 'again',
          },
        },
      },
    ]);
    prisma.chunk.findMany.mockResolvedValue([]);
    prisma.card.findMany.mockResolvedValue([]);

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
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        nextActionableItem: expect.objectContaining({
          cardId: 'card-1',
        }),
      }),
    );
  });
});

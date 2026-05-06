import type { PrismaService } from '../../prisma/prisma.service';
import { CardsService } from './cards.service';

function createPrismaMock() {
  const prisma = {
    deck: {
      findFirst: jest.fn(),
    },
    card: {
      create: jest.fn(),
      findMany: jest.fn(),
    },
    chunk: {
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    chunkReviewState: {
      upsert: jest.fn(),
    },
    reviewState: {
      upsert: jest.fn(),
    },
    $transaction: jest.fn(),
  };

  const runInTransaction = async <T>(
    callback: (tx: typeof prisma) => Promise<T>,
  ): Promise<T> => await callback(prisma);

  prisma.$transaction.mockImplementation(runInTransaction as never);

  return prisma;
}

describe('CardsService', () => {
  it('initializes standalone review state for newly created deck cards', async () => {
    const prisma = createPrismaMock();
    const service = new CardsService(prisma as unknown as PrismaService);
    const now = new Date('2026-05-02T10:00:00.000Z');
    jest.useFakeTimers().setSystemTime(now);

    prisma.deck.findFirst.mockResolvedValue({ id: 'deck-1' });
    prisma.card.create.mockResolvedValue({
      id: 'card-1',
      ownerId: 'user-1',
      deckId: 'deck-1',
      kind: 'basic',
      fields: { front: 'front', back: 'back' },
      createdAt: now,
    });

    await expect(
      service.create(
        {
          deckId: 'deck-1',
          kind: 'basic',
          fields: { front: 'front', back: 'back' },
        },
        'user-1',
      ),
    ).resolves.toEqual(
      expect.objectContaining({
        id: 'card-1',
        deckId: 'deck-1',
      }),
    );

    expect(prisma.chunk.create).not.toHaveBeenCalled();
    expect(prisma.chunkReviewState.upsert).not.toHaveBeenCalled();
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

    jest.useRealTimers();
  });
});

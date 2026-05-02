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
    $transaction: jest.fn(),
  };

  const runInTransaction = async <T>(
    callback: (tx: typeof prisma) => Promise<T>,
  ): Promise<T> => await callback(prisma);

  prisma.$transaction.mockImplementation(runInTransaction as never);

  return prisma;
}

describe('CardsService', () => {
  it('adds newly created deck cards to immediate review inbox', async () => {
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
    prisma.card.findMany.mockResolvedValue([{ id: 'card-1' }]);
    prisma.chunk.findFirst.mockResolvedValue(null);
    prisma.chunk.create.mockResolvedValue({ id: 'chunk-inbox-1' });

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

    expect(prisma.chunk.create).toHaveBeenCalledWith({
      data: {
        ownerId: 'user-1',
        deckId: 'deck-1',
        title: 'Deck Inbox',
        position: 0,
        chunkCards: {
          create: [{ cardId: 'card-1', sequenceIndex: 0 }],
        },
      },
      select: {
        id: true,
      },
    });
    expect(prisma.chunkReviewState.upsert).toHaveBeenCalledWith({
      where: { chunkId: 'chunk-inbox-1' },
      update: {
        due: now,
        consecutiveSuccessCount: 0,
        lastGrade: null,
      },
      create: {
        chunkId: 'chunk-inbox-1',
        due: now,
        consecutiveSuccessCount: 0,
        lastGrade: null,
      },
    });

    jest.useRealTimers();
  });
});

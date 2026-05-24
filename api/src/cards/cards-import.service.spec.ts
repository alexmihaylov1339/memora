import { ForbiddenException } from '@nestjs/common';

import type { PrismaService } from '../../prisma/prisma.service';
import { CardsImportService } from './cards-import.service';

function createPrismaMock() {
  const prisma = {
    deck: {
      findFirst: jest.fn(),
    },
    card: {
      createManyAndReturn: jest.fn(),
    },
    deckCard: {
      createMany: jest.fn(),
    },
    reviewState: {
      createMany: jest.fn(),
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

describe('CardsImportService', () => {
  it('creates deck memberships and review state when importing into a deck', async () => {
    const now = new Date('2026-05-10T10:00:00.000Z');
    jest.useFakeTimers().setSystemTime(now);
    const prisma = createPrismaMock();
    const service = new CardsImportService(prisma as unknown as PrismaService);

    prisma.deck.findFirst.mockResolvedValue({ id: 'deck-1' });
    prisma.card.createManyAndReturn.mockResolvedValue([
      { id: 'card-1' },
      { id: 'card-2' },
    ]);

    await expect(
      service.bulkImportFromCsv(
        'user-1',
        [
          { front: 'front 1', back: 'back 1' },
          { front: 'front 2', back: 'back 2' },
        ],
        'deck-1',
      ),
    ).resolves.toEqual({ created: 2 });

    expect(prisma.card.createManyAndReturn).toHaveBeenCalledWith({
      data: [
        {
          ownerId: 'user-1',
          deckId: 'deck-1',
          kind: 'basic',
          fields: { front: 'front 1', back: 'back 1' },
        },
        {
          ownerId: 'user-1',
          deckId: 'deck-1',
          kind: 'basic',
          fields: { front: 'front 2', back: 'back 2' },
        },
      ],
      select: { id: true },
    });
    expect(prisma.deckCard.createMany).toHaveBeenCalledWith({
      data: [
        { deckId: 'deck-1', cardId: 'card-1' },
        { deckId: 'deck-1', cardId: 'card-2' },
      ],
      skipDuplicates: true,
    });
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
        {
          cardId: 'card-2',
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

    jest.useRealTimers();
  });

  it('throws before creating cards when deck is not owned by the user', async () => {
    const prisma = createPrismaMock();
    const service = new CardsImportService(prisma as unknown as PrismaService);
    prisma.deck.findFirst.mockResolvedValue(null);

    await expect(
      service.bulkImportFromCsv(
        'user-1',
        [{ front: 'front', back: 'back' }],
        'deck-1',
      ),
    ).rejects.toThrow(ForbiddenException);

    expect(prisma.$transaction).not.toHaveBeenCalled();
  });
});

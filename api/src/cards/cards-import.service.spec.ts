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
  it('creates standalone cards without deck memberships when no deck is provided', async () => {
    const prisma = createPrismaMock();
    const service = new CardsImportService(prisma as unknown as PrismaService);

    prisma.card.createManyAndReturn.mockResolvedValue([{ id: 'card-1' }]);

    await expect(
      service.bulkImportFromCsv('user-1', [{ front: 'front', back: 'back' }]),
    ).resolves.toEqual({ created: 1 });

    expect(prisma.deck.findFirst).not.toHaveBeenCalled();
    expect(prisma.card.createManyAndReturn).toHaveBeenCalledWith({
      data: [
        {
          ownerId: 'user-1',
          deckId: null,
          kind: 'basic',
          fields: { front: 'front', back: 'back' },
        },
      ],
      select: { id: true },
    });
    expect(prisma.deckCard.createMany).not.toHaveBeenCalled();
    expect(prisma.reviewState.upsert).not.toHaveBeenCalled();
  });

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
    expect(prisma.reviewState.upsert).toHaveBeenCalledTimes(2);

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

  it('returns without opening a transaction when no rows are provided', async () => {
    const prisma = createPrismaMock();
    const service = new CardsImportService(prisma as unknown as PrismaService);

    await expect(service.bulkImportFromCsv('user-1', [])).resolves.toEqual({
      created: 0,
    });

    expect(prisma.deck.findFirst).not.toHaveBeenCalled();
    expect(prisma.$transaction).not.toHaveBeenCalled();
    expect(prisma.card.createManyAndReturn).not.toHaveBeenCalled();
  });
});

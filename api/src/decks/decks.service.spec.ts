import { DecksService } from './decks.service';
import type { PrismaService } from '../../prisma/prisma.service';

function createPrismaMock() {
  const prisma = {
    deck: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    deckShare: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      deleteMany: jest.fn(),
    },
    user: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
    },
    card: {
      findMany: jest.fn(),
      updateMany: jest.fn(),
      deleteMany: jest.fn(),
    },
    chunk: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      updateMany: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    chunkCard: {
      deleteMany: jest.fn(),
    },
    $transaction: jest.fn(),
  };

  const runInTransaction = async <T>(
    callback: (tx: typeof prisma) => Promise<T>,
  ): Promise<T> => await callback(prisma);

  prisma.$transaction.mockImplementation(runInTransaction as never);

  return prisma;
}

describe('DecksService', () => {
  let service: DecksService;
  let prisma: ReturnType<typeof createPrismaMock>;

  beforeEach(() => {
    prisma = createPrismaMock();
    service = new DecksService(prisma as unknown as PrismaService);
  });

  it('findAll returns owned and shared decks', async () => {
    prisma.deck.findMany
      .mockResolvedValueOnce([{ id: 'deck-owned' }, { id: 'deck-shared' }])
      .mockResolvedValueOnce([
        {
          id: 'deck-owned',
          name: 'Owned',
          _count: { cards: 2 },
        },
        {
          id: 'deck-shared',
          name: 'Shared',
          _count: { cards: 1 },
        },
      ]);
    prisma.deckShare.findMany.mockResolvedValueOnce([
      { deckId: 'deck-shared' },
    ]);

    await expect(service.findAll('user-1')).resolves.toEqual([
      { id: 'deck-owned', name: 'Owned', count: 2 },
      { id: 'deck-shared', name: 'Shared', count: 1 },
    ]);
  });

  it('findOne returns a shared deck with shared users', async () => {
    prisma.deck.findMany.mockResolvedValueOnce([]);
    prisma.deckShare.findMany.mockResolvedValueOnce([
      { deckId: 'deck-shared' },
    ]);
    prisma.deck.findFirst.mockResolvedValue({
      id: 'deck-shared',
      name: 'Shared',
      description: 'Visible to me',
      createdAt: new Date('2026-04-01T10:00:00.000Z'),
      updatedAt: new Date('2026-04-01T11:00:00.000Z'),
      _count: { cards: 3 },
      shares: [
        {
          id: 'share-1',
          deckId: 'deck-shared',
          permission: 'view',
          createdAt: new Date('2026-04-01T10:30:00.000Z'),
          updatedAt: new Date('2026-04-01T10:30:00.000Z'),
          user: {
            id: 'user-2',
            email: 'shared@example.com',
            name: 'Shared User',
            createdAt: new Date('2026-04-01T10:00:00.000Z'),
            updatedAt: new Date('2026-04-01T10:00:00.000Z'),
          },
        },
      ],
    });

    await expect(service.findOne('deck-shared', 'user-1')).resolves.toEqual({
      id: 'deck-shared',
      name: 'Shared',
      description: 'Visible to me',
      count: 3,
      createdAt: new Date('2026-04-01T10:00:00.000Z'),
      updatedAt: new Date('2026-04-01T11:00:00.000Z'),
      sharedUsers: [
        {
          id: 'share-1',
          deckId: 'deck-shared',
          userId: 'user-2',
          email: 'shared@example.com',
          name: 'Shared User',
          permission: 'view',
          createdAt: new Date('2026-04-01T10:30:00.000Z'),
          updatedAt: new Date('2026-04-01T10:30:00.000Z'),
        },
      ],
    });
  });

  it('shareDeck returns not found when the deck is missing', async () => {
    prisma.deck.findFirst.mockResolvedValue(null);

    await expect(
      service.shareDeck('deck-missing', 'shared@example.com', 'view', 'user-1'),
    ).resolves.toEqual({ status: 'not_found' });
  });

  it('shareDeck resolves the target user by email and creates a share', async () => {
    prisma.deck.findFirst.mockResolvedValue({ id: 'deck-1' });
    prisma.user.findUnique.mockResolvedValue({
      id: 'user-2',
      email: 'shared@example.com',
      name: 'Shared User',
    });
    prisma.deckShare.findUnique.mockResolvedValue(null);
    prisma.deckShare.create.mockResolvedValue({
      id: 'share-1',
      deckId: 'deck-1',
      permission: 'view',
      createdAt: new Date('2026-04-01T12:00:00.000Z'),
      updatedAt: new Date('2026-04-01T12:00:00.000Z'),
      user: {
        id: 'user-2',
        email: 'shared@example.com',
        name: 'Shared User',
        createdAt: new Date('2026-04-01T10:00:00.000Z'),
        updatedAt: new Date('2026-04-01T10:00:00.000Z'),
      },
    });

    await expect(
      service.shareDeck('deck-1', 'shared@example.com', 'view', 'user-1'),
    ).resolves.toEqual({
      status: 'shared',
      share: {
        id: 'share-1',
        deckId: 'deck-1',
        userId: 'user-2',
        email: 'shared@example.com',
        name: 'Shared User',
        permission: 'view',
        createdAt: new Date('2026-04-01T12:00:00.000Z'),
        updatedAt: new Date('2026-04-01T12:00:00.000Z'),
      },
    });
  });

  it('shareDeck returns the right errors for missing, ambiguous, self, and duplicate targets', async () => {
    prisma.deck.findFirst.mockResolvedValue({ id: 'deck-1' });
    prisma.user.findUnique
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce({
        id: 'user-self',
        email: 'self@example.com',
        name: 'Self',
      })
      .mockResolvedValueOnce({
        id: 'user-2',
        email: 'shared@example.com',
        name: 'Shared User',
      });
    prisma.user.findMany
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([{ id: 'user-2a' }, { id: 'user-2b' }]);

    await expect(
      service.shareDeck('deck-1', 'missing@example.com', 'view', 'user-1'),
    ).resolves.toEqual({ status: 'share_target_not_found' });

    await expect(
      service.shareDeck('deck-1', 'ambiguous', 'view', 'user-1'),
    ).resolves.toEqual({ status: 'share_target_ambiguous' });

    await expect(
      service.shareDeck('deck-1', 'self@example.com', 'view', 'user-self'),
    ).resolves.toEqual({ status: 'cannot_share_with_self' });

    prisma.deckShare.findUnique.mockResolvedValue({
      id: 'existing-share',
    });
    prisma.deckShare.findUnique.mockResolvedValueOnce({
      id: 'existing-share',
    });

    await expect(
      service.shareDeck('deck-1', 'shared@example.com', 'view', 'user-1'),
    ).resolves.toEqual({ status: 'already_shared' });
  });

  it('removeShare returns false when the deck or share is missing', async () => {
    prisma.deck.findFirst.mockResolvedValueOnce(null).mockResolvedValueOnce({
      id: 'deck-1',
    });
    prisma.deckShare.deleteMany.mockResolvedValue({ count: 0 });

    await expect(
      service.removeShare('deck-missing', 'user-2', 'user-1'),
    ).resolves.toBe(false);

    await expect(
      service.removeShare('deck-1', 'user-2', 'user-1'),
    ).resolves.toBe(false);
  });
});

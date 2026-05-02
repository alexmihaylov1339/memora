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
    chunkReviewState: {
      upsert: jest.fn(),
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
    const now = new Date('2026-05-02T10:00:00.000Z');
    jest.useFakeTimers().setSystemTime(now);

    prisma.deck.findMany
      .mockResolvedValueOnce([{ id: 'deck-owned' }, { id: 'deck-shared' }])
      .mockResolvedValueOnce([
        {
          id: 'deck-owned',
          name: 'Owned',
          _count: { cards: 4 },
        },
        {
          id: 'deck-shared',
          name: 'Shared',
          _count: { cards: 2 },
        },
      ]);
    prisma.deckShare.findMany.mockResolvedValueOnce([
      { deckId: 'deck-shared' },
    ]);
    prisma.chunk.findMany.mockResolvedValueOnce([
      {
        id: 'chunk-owned-due',
        deckId: 'deck-owned',
        title: 'Owned due',
        position: 0,
        deck: { reviewIntervalHours: [1, 24] },
        reviewState: {
          id: 'state-owned',
          chunkId: 'chunk-owned-due',
          due: new Date('2026-05-02T09:00:00.000Z'),
          consecutiveSuccessCount: 0,
          lastGrade: null,
          createdAt: now,
          updatedAt: now,
        },
        chunkCards: [
          { cardId: 'card-owned-1', sequenceIndex: 0 },
          { cardId: 'card-owned-2', sequenceIndex: 1 },
          { cardId: 'card-owned-3', sequenceIndex: 2 },
        ],
      },
      {
        id: 'chunk-shared-future',
        deckId: 'deck-shared',
        title: 'Shared future',
        position: 0,
        deck: { reviewIntervalHours: [1, 24] },
        reviewState: {
          id: 'state-shared',
          chunkId: 'chunk-shared-future',
          due: new Date('2026-05-02T11:00:00.000Z'),
          consecutiveSuccessCount: 0,
          lastGrade: null,
          createdAt: now,
          updatedAt: now,
        },
        chunkCards: [{ cardId: 'card-shared', sequenceIndex: 0 }],
      },
    ]);
    prisma.card.findMany.mockResolvedValueOnce([
      { deckId: 'deck-owned' },
      { deckId: 'deck-shared' },
    ]);

    await expect(service.findAll('user-1')).resolves.toEqual([
      { id: 'deck-owned', name: 'Owned', count: 4, dueCount: 4 },
      { id: 'deck-shared', name: 'Shared', count: 2, dueCount: 1 },
    ]);

    jest.useRealTimers();
  });

  it('creates deck inbox chunk so newly attached cards are immediately reviewable', async () => {
    const now = new Date('2026-04-26T10:00:00.000Z');
    jest.useFakeTimers().setSystemTime(now);

    prisma.card.findMany
      .mockResolvedValueOnce([{ id: 'card-1' }])
      .mockResolvedValueOnce([{ id: 'card-1' }]);
    prisma.deck.create.mockResolvedValue({
      id: 'deck-1',
      name: 'Deck 1',
      description: null,
      reviewIntervalHours: [2, 24],
      ownerId: 'user-1',
      createdAt: now,
      updatedAt: now,
    });
    prisma.chunk.findFirst.mockResolvedValue(null);
    prisma.chunk.create.mockResolvedValue({ id: 'chunk-inbox-1' });

    await expect(
      service.create('Deck 1', undefined, ['card-1'], [], 'user-1', [2, 24]),
    ).resolves.toEqual(
      expect.objectContaining({
        status: 'created',
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
    expect(prisma.chunkReviewState.upsert).toHaveBeenCalledTimes(1);
    expect(prisma.deck.create).toHaveBeenCalledWith({
      data: {
        name: 'Deck 1',
        description: undefined,
        reviewIntervalHours: [2, 24],
        ownerId: 'user-1',
      },
    });

    jest.useRealTimers();
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
      reviewIntervalHours: [4, 24],
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
      reviewIntervalHours: [4, 24],
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

  it('updates deck review intervals without recalculating chunk due dates', async () => {
    const createdAt = new Date('2026-04-01T10:00:00.000Z');
    const updatedAt = new Date('2026-04-01T11:00:00.000Z');

    prisma.deck.findFirst.mockResolvedValue({ id: 'deck-1' });
    prisma.deck.update.mockResolvedValue({
      id: 'deck-1',
      name: 'Deck 1',
      description: null,
      reviewIntervalHours: [1, 24, 168],
      createdAt,
      updatedAt,
      _count: { cards: 0 },
      shares: [],
    });

    await expect(
      service.update('deck-1', { reviewIntervalHours: [1, 24, 168] }, 'user-1'),
    ).resolves.toEqual({
      status: 'updated',
      deck: {
        id: 'deck-1',
        name: 'Deck 1',
        description: undefined,
        reviewIntervalHours: [1, 24, 168],
        count: 0,
        createdAt,
        updatedAt,
        sharedUsers: [],
      },
    });
    expect(prisma.chunkReviewState.upsert).not.toHaveBeenCalled();
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

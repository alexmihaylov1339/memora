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
    deckCard: {
      createMany: jest.fn(),
      deleteMany: jest.fn(),
      findMany: jest.fn(),
      groupBy: jest.fn(),
      count: jest.fn(),
    },
    user: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
    },
    card: {
      create: jest.fn(),
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
    reviewState: {
      createMany: jest.fn(),
      upsert: jest.fn(),
    },
    chunkCard: {
      createMany: jest.fn(),
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
          presentationMode: 'standard',
          isPublic: false,
          exerciseSettings: {
            whatDidYouHear: {
              choiceCount: 4,
            },
          },
        },
        {
          id: 'deck-shared',
          name: 'Shared',
          presentationMode: 'kids',
          isPublic: true,
          exerciseSettings: {
            whatDidYouHear: {
              choiceCount: 3,
            },
          },
        },
      ]);
    prisma.deckCard.groupBy.mockResolvedValueOnce([
      { deckId: 'deck-owned', _count: { cardId: 4 } },
      { deckId: 'deck-shared', _count: { cardId: 2 } },
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
    prisma.deckCard.findMany.mockResolvedValueOnce([
      { deckId: 'deck-owned' },
      { deckId: 'deck-shared' },
    ]);
    prisma.deckCard.findMany.mockResolvedValueOnce([
      {
        deckId: 'deck-owned',
        card: {
          id: 'card-audio-1',
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
        deckId: 'deck-owned',
        card: {
          id: 'card-audio-2',
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
    ]);

    await expect(service.findAll('user-1')).resolves.toEqual([
      {
        id: 'deck-owned',
        name: 'Owned',
        count: 4,
        dueCount: 2,
        presentationMode: 'standard',
        isPublic: false,
        isWhatDidYouHearEligible: true,
        whatDidYouHearEligibleCardCount: 2,
      },
      {
        id: 'deck-shared',
        name: 'Shared',
        count: 2,
        dueCount: 1,
        presentationMode: 'kids',
        isPublic: true,
        isWhatDidYouHearEligible: false,
        whatDidYouHearEligibleCardCount: 0,
      },
    ]);

    jest.useRealTimers();
  });

  it('initializes standalone review state for newly attached cards', async () => {
    const now = new Date('2026-04-26T10:00:00.000Z');
    jest.useFakeTimers().setSystemTime(now);

    prisma.card.findMany.mockResolvedValueOnce([{ id: 'card-1' }]);
    prisma.deck.create.mockResolvedValue({
      id: 'deck-1',
      name: 'Deck 1',
      description: null,
      presentationMode: 'kids',
      isPublic: false,
      reviewIntervalHours: [2, 24],
      exerciseSettings: {
        whatDidYouHear: {
          choiceCount: 4,
        },
      },
      ownerId: 'user-1',
      createdAt: now,
      updatedAt: now,
    });

    await expect(
      service.create(
        'Deck 1',
        undefined,
        ['card-1'],
        [],
        'user-1',
        'kids',
        [2, 24],
        {
          whatDidYouHear: {
            choiceCount: 4,
          },
        },
      ),
    ).resolves.toEqual(
      expect.objectContaining({
        status: 'created',
      }),
    );

    expect(prisma.chunk.create).not.toHaveBeenCalled();
    expect(prisma.chunkReviewState.upsert).not.toHaveBeenCalled();
    expect(prisma.deckCard.createMany).toHaveBeenCalledWith({
      data: [{ deckId: 'deck-1', cardId: 'card-1' }],
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
      ],
      skipDuplicates: true,
    });
    expect(prisma.deck.create).toHaveBeenCalledWith({
      data: {
        name: 'Deck 1',
        description: undefined,
        presentationMode: 'kids',
        isPublic: false,
        reviewIntervalHours: [2, 24],
        exerciseSettings: {
          whatDidYouHear: {
            choiceCount: 4,
          },
        },
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
      presentationMode: 'kids',
      isPublic: true,
      reviewIntervalHours: [4, 24],
      exerciseSettings: {
        whatDidYouHear: {
          choiceCount: 3,
        },
      },
      createdAt: new Date('2026-04-01T10:00:00.000Z'),
      updatedAt: new Date('2026-04-01T11:00:00.000Z'),
      owner: {
        id: 'user-owner',
        email: 'owner@example.com',
        name: 'Owner',
      },
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
    prisma.deckCard.count.mockResolvedValueOnce(3);

    await expect(service.findOne('deck-shared', 'user-1')).resolves.toEqual({
      id: 'deck-shared',
      name: 'Shared',
      description: 'Visible to me',
      presentationMode: 'kids',
      isPublic: true,
      reviewIntervalHours: [4, 24],
      exerciseSettings: {
        whatDidYouHear: {
          choiceCount: 3,
        },
      },
      isWhatDidYouHearEligible: false,
      whatDidYouHearEligibleCardCount: 0,
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
      presentationMode: 'kids',
      isPublic: false,
      reviewIntervalHours: [1, 24, 168],
      exerciseSettings: {
        whatDidYouHear: {
          choiceCount: 2,
        },
      },
      createdAt,
      updatedAt,
      owner: {
        id: 'user-1',
        email: 'user@example.com',
        name: 'User',
      },
      shares: [],
    });
    prisma.deckCard.count.mockResolvedValueOnce(0);

    await expect(
      service.update('deck-1', { reviewIntervalHours: [1, 24, 168] }, 'user-1'),
    ).resolves.toEqual({
      status: 'updated',
      deck: {
        id: 'deck-1',
        name: 'Deck 1',
        description: undefined,
        presentationMode: 'kids',
        isPublic: false,
        reviewIntervalHours: [1, 24, 168],
        exerciseSettings: {
          whatDidYouHear: {
            choiceCount: 2,
          },
        },
        isWhatDidYouHearEligible: false,
        whatDidYouHearEligibleCardCount: 0,
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

  it('lists public decks with owner attribution and card counts', async () => {
    prisma.deck.findMany.mockResolvedValue([
      {
        id: 'deck-1',
        name: 'Cars',
        description: 'Picture deck',
        presentationMode: 'kids',
        isPublic: true,
        reviewIntervalHours: [1, 24],
        exerciseSettings: {
          whatDidYouHear: {
            choiceCount: 4,
          },
        },
        createdAt: new Date('2026-05-21T10:00:00.000Z'),
        updatedAt: new Date('2026-05-21T11:00:00.000Z'),
        owner: {
          id: 'user-1',
          email: 'alex@example.com',
          name: 'Alex',
        },
      },
    ]);
    prisma.deckCard.groupBy.mockResolvedValue([
      { deckId: 'deck-1', _count: { cardId: 6 } },
    ]);
    prisma.deckCard.findMany.mockResolvedValue([
      {
        deckId: 'deck-1',
        card: {
          id: 'card-audio-1',
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
        deckId: 'deck-1',
        card: {
          id: 'card-audio-2',
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
    ]);

    await expect(service.listPublic()).resolves.toEqual([
      {
        id: 'deck-1',
        name: 'Cars',
        description: 'Picture deck',
        count: 6,
        presentationMode: 'kids',
        exerciseSettings: {
          whatDidYouHear: {
            choiceCount: 4,
          },
        },
        isWhatDidYouHearEligible: true,
        whatDidYouHearEligibleCardCount: 2,
        ownerDisplayName: 'Alex',
        ownerUserId: 'user-1',
        createdAt: new Date('2026-05-21T10:00:00.000Z'),
        updatedAt: new Date('2026-05-21T11:00:00.000Z'),
      },
    ]);
  });

  it('copies a public deck into the current users library', async () => {
    const now = new Date('2026-05-21T12:00:00.000Z');
    jest.useFakeTimers().setSystemTime(now);

    prisma.deck.findFirst.mockResolvedValue({
      id: 'public-deck-1',
      name: 'Cars',
      description: 'Picture deck',
      presentationMode: 'kids',
      isPublic: true,
      reviewIntervalHours: [1, 24],
      exerciseSettings: {
        whatDidYouHear: {
          choiceCount: 4,
        },
      },
      deckCards: [
        {
          cardId: 'card-1',
          card: {
            id: 'card-1',
            kind: 'image_audio',
            fields: { label: 'Car' },
          },
        },
      ],
      chunks: [
        {
          id: 'chunk-1',
          title: 'Cars chunk',
          position: 0,
          chunkCards: [
            {
              cardId: 'card-1',
              sequenceIndex: 0,
              offsetDays: null,
              card: {
                id: 'card-1',
                kind: 'image_audio',
                fields: { label: 'Car' },
              },
            },
          ],
        },
      ],
    });
    prisma.deck.create.mockResolvedValue({
      id: 'copied-deck-1',
      name: 'Cars',
      description: 'Picture deck',
      presentationMode: 'kids',
      isPublic: false,
      reviewIntervalHours: [1, 24],
      exerciseSettings: {
        whatDidYouHear: {
          choiceCount: 4,
        },
      },
      createdAt: now,
      updatedAt: now,
    });
    prisma.card.create.mockResolvedValue({
      id: 'copied-card-1',
    });
    prisma.chunk.create.mockResolvedValue({
      id: 'copied-chunk-1',
    });

    await expect(
      service.copyPublicDeck('public-deck-1', 'user-2'),
    ).resolves.toEqual({
      status: 'copied',
      deck: {
        id: 'copied-deck-1',
        name: 'Cars',
        description: 'Picture deck',
        presentationMode: 'kids',
        isPublic: false,
        reviewIntervalHours: [1, 24],
        exerciseSettings: {
          whatDidYouHear: {
            choiceCount: 4,
          },
        },
        isWhatDidYouHearEligible: false,
        whatDidYouHearEligibleCardCount: 0,
        createdAt: now,
        updatedAt: now,
      },
    });

    expect(prisma.card.create).toHaveBeenCalledWith({
      data: {
        ownerId: 'user-2',
        deckId: 'copied-deck-1',
        kind: 'image_audio',
        fields: { label: 'Car' },
      },
    });
    expect(prisma.deckCard.createMany).toHaveBeenCalledWith({
      data: [{ deckId: 'copied-deck-1', cardId: 'copied-card-1' }],
      skipDuplicates: true,
    });
    expect(prisma.chunkCard.createMany).toHaveBeenCalledWith({
      data: [
        {
          chunkId: 'copied-chunk-1',
          cardId: 'copied-card-1',
          sequenceIndex: 0,
          offsetDays: null,
        },
      ],
    });

    jest.useRealTimers();
  });
});

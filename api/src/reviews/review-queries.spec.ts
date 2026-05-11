import type { PrismaService } from '../../prisma/prisma.service';
import { getStandaloneCardQueueItems } from './review-queries';

function createPrismaMock() {
  return {
    deck: {
      findMany: jest.fn().mockResolvedValue([{ id: 'deck-1' }]),
    },
    deckShare: {
      findMany: jest.fn().mockResolvedValue([]),
    },
    card: {
      findMany: jest.fn().mockResolvedValue([]),
    },
    deckCard: {
      findMany: jest.fn().mockResolvedValue([]),
    },
  };
}

describe('review queries', () => {
  it('queries only due standalone cards outside deck chunks', async () => {
    const prisma = createPrismaMock();
    const now = new Date('2026-05-06T10:00:00.000Z');

    await getStandaloneCardQueueItems(
      prisma as unknown as PrismaService,
      'user-1',
      now,
      'deck-1',
    );

    expect(prisma.deckCard.findMany).toHaveBeenCalledWith({
      where: {
        deckId: { in: ['deck-1'] },
        card: {
          chunkCards: {
            none: {
              chunk: {
                deckId: { in: ['deck-1'] },
              },
            },
          },
          state: {
            is: {
              due: { lte: now },
            },
          },
        },
      },
      orderBy: [{ createdAt: 'asc' }, { cardId: 'asc' }],
      select: {
        deckId: true,
        card: {
          select: {
            id: true,
            kind: true,
            fields: true,
            createdAt: true,
            state: {
              select: {
                due: true,
                consecutiveSuccessCount: true,
                lastGrade: true,
              },
            },
          },
        },
      },
    });
  });

  it('maps deck-card memberships back to standalone queue records', async () => {
    const due = new Date('2026-05-06T09:00:00.000Z');
    const createdAt = new Date('2026-05-01T10:00:00.000Z');
    const prisma = createPrismaMock();
    prisma.deck.findMany.mockResolvedValue([{ id: 'deck-1' }, { id: 'deck-2' }]);
    prisma.deckCard.findMany.mockResolvedValue([
      {
        deckId: 'deck-1',
        card: {
          id: 'card-1',
          kind: 'basic',
          fields: { front: 'front', back: 'back' },
          createdAt,
          state: {
            due,
            consecutiveSuccessCount: 0,
            lastGrade: null,
          },
        },
      },
      {
        deckId: 'deck-2',
        card: {
          id: 'card-1',
          kind: 'basic',
          fields: { front: 'front', back: 'back' },
          createdAt,
          state: {
            due,
            consecutiveSuccessCount: 0,
            lastGrade: null,
          },
        },
      },
    ]);

    await expect(
      getStandaloneCardQueueItems(
        prisma as unknown as PrismaService,
        'user-1',
        new Date('2026-05-06T10:00:00.000Z'),
      ),
    ).resolves.toEqual([
      {
        id: 'card-1',
        deckId: 'deck-1',
        kind: 'basic',
        fields: { front: 'front', back: 'back' },
        createdAt,
        state: {
          due,
          consecutiveSuccessCount: 0,
          lastGrade: null,
        },
      },
      {
        id: 'card-1',
        deckId: 'deck-2',
        kind: 'basic',
        fields: { front: 'front', back: 'back' },
        createdAt,
        state: {
          due,
          consecutiveSuccessCount: 0,
          lastGrade: null,
        },
      },
    ]);
  });
});

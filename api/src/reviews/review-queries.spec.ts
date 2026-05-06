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

    expect(prisma.card.findMany).toHaveBeenCalledWith({
      where: {
        deckId: { in: ['deck-1'] },
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
      orderBy: [{ createdAt: 'asc' }, { id: 'asc' }],
      select: {
        id: true,
        deckId: true,
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
    });
  });
});

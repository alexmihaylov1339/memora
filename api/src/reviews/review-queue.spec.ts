import type { ChunkWithCards } from './chunk-progress';
import {
  buildEligibleQueueItems,
  buildStandaloneCardQueueItems,
} from './review-queue';

function buildChunk(
  consecutiveSuccessCount: number,
  cardCount = 5,
): ChunkWithCards {
  const due = new Date('2026-05-06T10:00:00.000Z');

  return {
    id: 'chunk-1',
    deckId: 'deck-1',
    title: 'Chunk 1',
    position: 1,
    deck: { reviewIntervalHours: [4, 8, 12, 24, 48, 72] },
    reviewState: {
      id: 'chunk-state-1',
      chunkId: 'chunk-1',
      due,
      consecutiveSuccessCount,
      lastGrade: null,
      createdAt: due,
      updatedAt: due,
    },
    chunkCards: Array.from({ length: cardCount }, (_, index) => ({
      cardId: `card-${index}`,
      sequenceIndex: index,
      card: {
        id: `card-${index}`,
        kind: 'basic',
        fields: { front: `front ${index}`, back: `back ${index}` },
        createdAt: new Date(`2026-05-0${index + 1}T10:00:00.000Z`),
      },
    })),
  };
}

describe('review queue builders', () => {
  it('returns exactly one due card for a chunk session', () => {
    const items = buildEligibleQueueItems(
      [buildChunk(2)],
      new Date('2026-05-06T11:00:00.000Z'),
    );

    expect(items).toHaveLength(1);
    expect(items[0]).toEqual(
      expect.objectContaining({
        cardId: 'card-2',
        positionInChunk: 2,
      }),
    );
  });

  it('wraps chunk card selection after the last card', () => {
    const items = buildEligibleQueueItems(
      [buildChunk(5)],
      new Date('2026-05-06T11:00:00.000Z'),
    );

    expect(items).toHaveLength(1);
    expect(items[0]?.cardId).toBe('card-0');
  });

  it('builds standalone queue items from due standalone card states', () => {
    const items = buildStandaloneCardQueueItems([
      {
        id: 'standalone-card-1',
        deckId: 'deck-1',
        kind: 'basic',
        fields: { front: 'front', back: 'back' },
        createdAt: new Date('2026-05-06T09:00:00.000Z'),
        state: {
          due: new Date('2026-05-06T10:00:00.000Z'),
          consecutiveSuccessCount: 0,
          lastGrade: null,
        },
      },
    ]);

    expect(items).toEqual([
      expect.objectContaining({
        cardId: 'standalone-card-1',
        chunkId: 'standalone:standalone-card-1',
        chunkTitle: 'Standalone Card',
        consecutiveSuccessCount: 0,
      }),
    ]);
  });
});

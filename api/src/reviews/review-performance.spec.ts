import type { Grade } from '@prisma/client';
import { performance } from 'node:perf_hooks';
import type { PrismaService } from '../../prisma/prisma.service';
import * as reviewObservability from './review-observability';
import { ReviewsService } from './reviews.service';

const ITERATIONS = 100;
const NOW = new Date('2026-04-27T12:10:00.000Z');

function percentile(samples: number[], percentileRank: number): number {
  const sorted = [...samples].sort((left, right) => left - right);
  const index = Math.ceil((percentileRank / 100) * sorted.length) - 1;
  return sorted[Math.max(0, Math.min(index, sorted.length - 1))];
}

async function measure(operation: () => Promise<unknown>): Promise<{
  p50: number;
  p95: number;
}> {
  const samples: number[] = [];

  for (let index = 0; index < ITERATIONS; index += 1) {
    const startedAt = performance.now();
    await operation();
    samples.push(performance.now() - startedAt);
  }

  return {
    p50: Number(percentile(samples, 50).toFixed(3)),
    p95: Number(percentile(samples, 95).toFixed(3)),
  };
}

function createPrismaMock() {
  const prisma = {
    deck: {
      findMany: jest.fn(),
    },
    deckShare: {
      findMany: jest.fn(),
    },
    chunk: {
      findFirst: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
    },
    chunkReviewState: {
      upsert: jest.fn(),
      update: jest.fn(),
    },
    reviewState: {
      findUnique: jest.fn(),
      upsert: jest.fn(),
    },
    reviewLog: {
      create: jest.fn(),
    },
    $transaction: jest.fn(),
  };

  prisma.$transaction.mockImplementation(
    async <T>(callback: (tx: typeof prisma) => Promise<T>): Promise<T> =>
      callback(prisma),
  );

  return prisma;
}

function buildChunk(chunkIndex: number, cardCount = 3) {
  return {
    id: `chunk-${chunkIndex}`,
    deckId: 'deck-1',
    title: `Chunk ${chunkIndex}`,
    position: chunkIndex,
    reviewState: {
      id: `state-${chunkIndex}`,
      chunkId: `chunk-${chunkIndex}`,
      due: NOW,
      consecutiveSuccessCount: chunkIndex % cardCount,
      lastGrade: 'good' satisfies Grade,
      createdAt: NOW,
      updatedAt: NOW,
    },
    chunkCards: Array.from({ length: cardCount }, (_, cardIndex) => ({
      cardId: `card-${chunkIndex}-${cardIndex}`,
      sequenceIndex: cardIndex,
      card: {
        id: `card-${chunkIndex}-${cardIndex}`,
        kind: 'basic',
        fields: {
          front: `Front ${chunkIndex}-${cardIndex}`,
          back: `Back ${chunkIndex}-${cardIndex}`,
        },
        createdAt: new Date(NOW.getTime() - (chunkIndex + cardIndex) * 1000),
      },
    })),
  };
}

describe('review performance baseline', () => {
  let prisma: ReturnType<typeof createPrismaMock>;
  let service: ReviewsService;

  beforeEach(() => {
    jest.spyOn(reviewObservability, 'emitReviewQueueFetched').mockReturnValue();
    jest.spyOn(reviewObservability, 'emitReviewGraded').mockReturnValue();
    jest
      .spyOn(reviewObservability, 'emitReviewUnsupportedDetected')
      .mockReturnValue();

    prisma = createPrismaMock();
    service = new ReviewsService(prisma as unknown as PrismaService);

    prisma.deck.findMany.mockResolvedValue([{ id: 'deck-1' }]);
    prisma.deckShare.findMany.mockResolvedValue([]);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('records queue fetch and grade submit p50/p95 baselines', async () => {
    const queueChunks = Array.from({ length: 50 }, (_, index) =>
      buildChunk(index),
    );
    const gradeChunk = buildChunk(0);

    prisma.chunk.findMany.mockResolvedValue(queueChunks);
    prisma.chunk.findFirst.mockResolvedValue(gradeChunk);
    prisma.chunkReviewState.upsert.mockResolvedValue({
      id: 'state-0',
      chunkId: 'chunk-0',
      due: NOW,
      consecutiveSuccessCount: 0,
      lastGrade: null,
      createdAt: NOW,
      updatedAt: NOW,
    });
    prisma.reviewState.findUnique.mockResolvedValue(null);
    prisma.chunkReviewState.update.mockResolvedValue(undefined);
    prisma.reviewState.upsert.mockResolvedValue(undefined);
    prisma.reviewLog.create.mockResolvedValue(undefined);

    const queue = await measure(() =>
      service.getEligibleQueueItems('user-1', NOW),
    );
    const grade = await measure(() =>
      service.gradeReview('card-0-0', 'good', 'user-1', NOW),
    );

    console.log(
      JSON.stringify({
        event: 'review_performance_baseline',
        iterations: ITERATIONS,
        timestamp: NOW.toISOString(),
        queueFetchMs: queue,
        gradeSubmitMs: grade,
      }),
    );

    expect(queue.p95).toBeLessThan(50);
    expect(grade.p95).toBeLessThan(50);
  });
});

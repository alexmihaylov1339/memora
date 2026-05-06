import { PrismaService } from '../../prisma/prisma.service';
import {
  deriveChunkReviewState,
  type ChunkProgressSnapshot,
} from './chunk-progress';
import {
  findAccessibleDeckIds,
  findChunkWithCards,
  findChunksWithReviewState,
} from './review-access';
import { buildPracticeItems } from './review-practice';
import {
  buildEligibleQueueItems,
  buildFullQueueItems,
  buildStandaloneCardQueueItems,
  type PracticeItem,
  type ReviewQueueItem,
  type StandaloneCardQueueRecord,
} from './review-queue';
import { ensureChunkReviewState } from './review-grade';

export type { ChunkProgressSnapshot } from './chunk-progress';
export type { PracticeItem, ReviewQueueItem } from './review-queue';

export async function getChunkProgress(
  prisma: PrismaService,
  chunkId: string,
  now = new Date(),
): Promise<ChunkProgressSnapshot | null> {
  const chunk = await findChunkWithCards(prisma, chunkId);

  if (!chunk) {
    return null;
  }

  const state = await ensureChunkReviewState(prisma, chunkId, now);
  return deriveChunkReviewState(chunk, now, state);
}

export async function getEligibleQueueItems(
  prisma: PrismaService,
  userId: string,
  now = new Date(),
  deckId?: string,
): Promise<ReviewQueueItem[]> {
  const [chunks, standaloneCards] = await Promise.all([
    findChunksWithReviewState(prisma, userId, deckId),
    getStandaloneCardQueueItems(prisma, userId, now, deckId),
  ]);

  return buildFullQueueItems(
    buildEligibleQueueItems(chunks, now),
    buildStandaloneCardQueueItems(standaloneCards),
  );
}

export async function getStandaloneCardQueueItems(
  prisma: PrismaService,
  userId: string,
  now = new Date(),
  deckId?: string,
): Promise<StandaloneCardQueueRecord[]> {
  const deckIds = await findAccessibleDeckIds(prisma, userId);
  const scopedDeckIds = deckId
    ? deckIds.filter((id) => id === deckId)
    : deckIds;

  if (scopedDeckIds.length === 0) {
    return [];
  }

  return (await prisma.card.findMany({
    where: {
      deckId: { in: scopedDeckIds },
      chunkCards: {
        none: {
          chunk: {
            deckId: { in: scopedDeckIds },
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
  })) as StandaloneCardQueueRecord[];
}

export async function getPracticeItems(
  prisma: PrismaService,
  userId: string,
  deckId: string,
): Promise<PracticeItem[]> {
  const chunks = await findChunksWithReviewState(prisma, userId, deckId);

  return buildPracticeItems(chunks);
}

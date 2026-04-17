import { PrismaService } from '../../prisma/prisma.service';
import {
  deriveChunkReviewState,
  type ChunkProgressSnapshot,
} from './chunk-progress';
import { findChunkWithCards, findChunksWithReviewState } from './review-access';
import { buildEligibleQueueItems, type ReviewQueueItem } from './review-queue';
import { ensureChunkReviewState } from './review-grade';

export type { ChunkProgressSnapshot } from './chunk-progress';
export type { ReviewQueueItem } from './review-queue';

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
): Promise<ReviewQueueItem[]> {
  const chunks = await findChunksWithReviewState(prisma, userId);
  return buildEligibleQueueItems(chunks, now);
}

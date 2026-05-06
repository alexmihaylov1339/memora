import type { PrismaService } from '../../prisma/prisma.service';
import { isNull } from '../common/utils/type-guards';
import {
  deriveChunkReviewState,
  type ChunkProgressSnapshot,
  type ChunkWithCards,
  type PersistedChunkReviewState,
} from './chunk-progress';
import { findChunksByCardId } from './review-access';
import {
  buildNextActionableItem,
  ensureChunkReviewState,
} from './review-grade';
import { getEligibleQueueItems } from './review-queries';
import type { ReviewQueueItem } from './review-queue';

export type ReviewableChunkForCard = {
  chunk: ChunkWithCards;
  state: PersistedChunkReviewState;
  snapshot: ChunkProgressSnapshot;
};

export type CurrentReviewChunkCard =
  | ChunkWithCards['chunkCards'][number]
  | null;

export async function findReviewableChunkForCard(
  prisma: PrismaService,
  cardId: string,
  userId: string,
  now: Date,
  deckId?: string,
): Promise<ReviewableChunkForCard | null> {
  const chunks = await findChunksByCardId(prisma, cardId, userId, deckId);

  for (const chunk of chunks) {
    const state = await ensureChunkReviewState(prisma, chunk.id, now);
    const snapshot = deriveChunkReviewState(chunk, now, state);

    if (snapshot.isDue && snapshot.currentCard?.cardId === cardId) {
      return { chunk, state, snapshot };
    }
  }

  return null;
}

export function getCurrentReviewChunkCard(
  chunk: ChunkWithCards,
  snapshot: ChunkProgressSnapshot,
): CurrentReviewChunkCard {
  if (isNull(snapshot.currentCard)) {
    return null;
  }

  return (
    chunk.chunkCards.find(
      (chunkCard) =>
        chunkCard.sequenceIndex === snapshot.currentCard?.sequenceIndex,
    ) ?? null
  );
}

export async function resolveNextActionableItemAfterGrade(
  prisma: PrismaService,
  input: {
    cardId: string;
    chunk: ChunkWithCards;
    isImmediateRetry: boolean;
    nextSnapshot: ChunkProgressSnapshot;
    now: Date;
    userId: string;
    deckId?: string;
  },
): Promise<ReviewQueueItem | null> {
  const sameChunkNextItem = buildNextActionableItem(
    input.chunk,
    input.nextSnapshot,
  );

  if (sameChunkNextItem && sameChunkNextItem.cardId !== input.cardId) {
    return sameChunkNextItem;
  }

  const queueItems = await getEligibleQueueItems(
    prisma,
    input.userId,
    input.now,
    input.deckId,
  );

  const nextDifferentQueueItem =
    queueItems.find((item) => item.cardId !== input.cardId) ?? null;

  return (
    nextDifferentQueueItem ??
    (input.isImmediateRetry ? sameChunkNextItem : null)
  );
}

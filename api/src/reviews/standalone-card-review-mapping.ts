import type { ChunkProgressSnapshot } from './chunk-progress';
import { getEligibleQueueItems } from './review-queries';
import type { ReviewQueueItem } from './review-queue';
import type {
  StandaloneReviewCard,
  StandaloneReviewState,
} from './standalone-card-review-types';
import type { PrismaService } from '../../prisma/prisma.service';

export function buildStandaloneSnapshot(
  card: StandaloneReviewCard,
  state: StandaloneReviewState,
  now: Date,
): ChunkProgressSnapshot {
  return {
    chunkId: `standalone:${card.id}`,
    deckId: card.deckId ?? '',
    title: 'Standalone Card',
    position: 0,
    due: state.due,
    isDue: state.due.getTime() <= now.getTime(),
    consecutiveSuccessCount: state.consecutiveSuccessCount,
    requiredConsecutiveSuccesses: 1,
    hasMastery: false,
    totalCards: 1,
    currentCard: {
      cardId: card.id,
      sequenceIndex: 0,
    },
    lastGrade: state.lastGrade,
  };
}

export async function resolveNextStandaloneActionableItem(
  prisma: PrismaService,
  input: {
    cardId: string;
    deckId?: string;
    isImmediateRetry: boolean;
    now: Date;
    userId: string;
  },
): Promise<ReviewQueueItem | null> {
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
    (input.isImmediateRetry
      ? queueItems.find((item) => item.cardId === input.cardId) ?? null
      : null)
  );
}

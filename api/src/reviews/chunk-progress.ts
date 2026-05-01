import type { Grade, Prisma } from '@prisma/client';
import {
  isNonNegativeInteger,
  isNull,
  isString,
} from '../common/utils/type-guards';
import {
  getCurrentChunkCardIndex,
  hasChunkMastery,
  resolveChunkReviewIntervalHours,
} from './chunk-scheduling';

export type PersistedChunkReviewState = {
  id: string;
  chunkId: string;
  due: Date;
  consecutiveSuccessCount: number;
  lastGrade: Grade | null;
  createdAt: Date;
  updatedAt: Date;
};

export type ChunkWithCards = {
  id: string;
  deckId: string;
  title: string;
  position: number;
  chunkCards: Array<{
    cardId: string;
    sequenceIndex: number;
    card?: {
      id: string;
      kind: string;
      fields: Prisma.JsonValue;
      createdAt: Date;
    };
  }>;
  reviewState?: PersistedChunkReviewState | null;
  deck?: {
    reviewIntervalHours: Prisma.JsonValue | null;
  } | null;
};

export type ChunkProgressSnapshot = {
  chunkId: string;
  deckId: string;
  title: string;
  position: number;
  due: Date;
  isDue: boolean;
  consecutiveSuccessCount: number;
  requiredConsecutiveSuccesses: number;
  hasMastery: boolean;
  totalCards: number;
  currentCard: {
    cardId: string;
    sequenceIndex: number;
  } | null;
  lastGrade: Grade | null;
};

const REVIEW_GRADES: Grade[] = ['again', 'hard', 'good', 'easy'];

function normalizeReviewDue(value: unknown, fallback: Date): Date {
  if (!(value instanceof Date)) {
    return fallback;
  }

  if (Number.isNaN(value.getTime())) {
    return fallback;
  }

  return value;
}

function normalizeConsecutiveSuccessCount(value: unknown): number {
  if (!isNonNegativeInteger(value)) {
    return 0;
  }

  return value;
}

function normalizeLastGrade(value: unknown): Grade | null {
  if (!isString(value)) {
    return null;
  }

  if (!REVIEW_GRADES.includes(value as Grade)) {
    return null;
  }

  return value as Grade;
}

export function deriveChunkReviewState(
  chunk: ChunkWithCards,
  now: Date,
  persistedState?: PersistedChunkReviewState | null,
): ChunkProgressSnapshot {
  const rawState = persistedState ?? chunk.reviewState;
  const reviewIntervalHours = resolveChunkReviewIntervalHours(
    chunk.deck?.reviewIntervalHours,
  );
  const requiredConsecutiveSuccesses = reviewIntervalHours.length;
  const due = normalizeReviewDue(rawState?.due, now);
  const consecutiveSuccessCount = normalizeConsecutiveSuccessCount(
    rawState?.consecutiveSuccessCount,
  );
  const lastGrade = normalizeLastGrade(rawState?.lastGrade);
  const totalCards = chunk.chunkCards.length;
  const currentCardIndex =
    totalCards > 0
      ? getCurrentChunkCardIndex(consecutiveSuccessCount, totalCards)
      : null;
  const currentCard = isNull(currentCardIndex)
    ? null
    : chunk.chunkCards[currentCardIndex];

  return {
    chunkId: chunk.id,
    deckId: chunk.deckId,
    title: chunk.title,
    position: chunk.position,
    due,
    isDue: due.getTime() <= now.getTime(),
    consecutiveSuccessCount,
    requiredConsecutiveSuccesses,
    hasMastery: hasChunkMastery(
      consecutiveSuccessCount,
      requiredConsecutiveSuccesses,
    ),
    totalCards,
    currentCard: currentCard
      ? {
          cardId: currentCard.cardId,
          sequenceIndex: currentCard.sequenceIndex,
        }
      : null,
    lastGrade,
  };
}

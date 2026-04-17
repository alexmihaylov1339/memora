import type { Grade, Prisma } from '@prisma/client';
import {
  DEFAULT_CHUNK_REQUIRED_CONSECUTIVE_SUCCESSES,
  getCurrentChunkCardIndex,
  hasChunkMastery,
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

export function deriveChunkReviewState(
  chunk: ChunkWithCards,
  now: Date,
  persistedState?: PersistedChunkReviewState | null,
): ChunkProgressSnapshot {
  const state = persistedState ??
    chunk.reviewState ?? {
      id: `ephemeral-${chunk.id}`,
      chunkId: chunk.id,
      due: now,
      consecutiveSuccessCount: 0,
      lastGrade: null,
      createdAt: now,
      updatedAt: now,
    };
  const totalCards = chunk.chunkCards.length;
  const currentCardIndex =
    totalCards > 0
      ? getCurrentChunkCardIndex(state.consecutiveSuccessCount, totalCards)
      : null;
  const currentCard =
    currentCardIndex === null ? null : chunk.chunkCards[currentCardIndex];

  return {
    chunkId: chunk.id,
    deckId: chunk.deckId,
    title: chunk.title,
    position: chunk.position,
    due: state.due,
    isDue: state.due.getTime() <= now.getTime(),
    consecutiveSuccessCount: state.consecutiveSuccessCount,
    requiredConsecutiveSuccesses: DEFAULT_CHUNK_REQUIRED_CONSECUTIVE_SUCCESSES,
    hasMastery: hasChunkMastery(state.consecutiveSuccessCount),
    totalCards,
    currentCard: currentCard
      ? {
          cardId: currentCard.cardId,
          sequenceIndex: currentCard.sequenceIndex,
        }
      : null,
    lastGrade: state.lastGrade,
  };
}

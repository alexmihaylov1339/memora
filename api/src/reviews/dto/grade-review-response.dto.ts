import type { Grade } from '@prisma/client';
import type {
  ChunkProgressSnapshot,
  GradeChunkReviewResult,
} from '../reviews.service';
import {
  serializeReviewQueueItem,
  type ReviewQueueItemDto,
} from './review-queue-response.dto';

export interface ChunkProgressSnapshotDto {
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
  stateCreatedAt: Date;
  stateUpdatedAt: Date;
}

export interface GradeReviewResponseDto {
  cardId: string;
  grade: Grade;
  wasSuccessful: boolean;
  advanced: boolean;
  reset: boolean;
  previousConsecutiveSuccessCount: number;
  consecutiveSuccessCount: number;
  due: Date;
  intervalHours: number;
  chunk: ChunkProgressSnapshotDto;
  nextActionableItem: ReviewQueueItemDto | null;
}

export function serializeChunkProgressSnapshot(
  snapshot: ChunkProgressSnapshot,
): ChunkProgressSnapshotDto {
  return {
    chunkId: snapshot.chunkId,
    deckId: snapshot.deckId,
    title: snapshot.title,
    position: snapshot.position,
    due: snapshot.due,
    isDue: snapshot.isDue,
    consecutiveSuccessCount: snapshot.consecutiveSuccessCount,
    requiredConsecutiveSuccesses: snapshot.requiredConsecutiveSuccesses,
    hasMastery: snapshot.hasMastery,
    totalCards: snapshot.totalCards,
    currentCard: snapshot.currentCard,
    lastGrade: snapshot.lastGrade,
    stateCreatedAt: snapshot.stateCreatedAt,
    stateUpdatedAt: snapshot.stateUpdatedAt,
  };
}

export function serializeGradeReviewResponse(
  result: GradeChunkReviewResult,
): GradeReviewResponseDto {
  return {
    cardId: result.cardId,
    grade: result.grade,
    wasSuccessful: result.wasSuccessful,
    advanced: result.advanced,
    reset: result.reset,
    previousConsecutiveSuccessCount: result.previousConsecutiveSuccessCount,
    consecutiveSuccessCount: result.consecutiveSuccessCount,
    due: result.due,
    intervalHours: result.intervalHours,
    chunk: serializeChunkProgressSnapshot(result.chunk),
    nextActionableItem: result.nextActionableItem
      ? serializeReviewQueueItem(result.nextActionableItem)
      : null,
  };
}

import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { Grade } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import {
  computeNextDueAt,
  getChunkReviewIntervalHours,
  getNextConsecutiveSuccessCount,
} from './chunk-scheduling';
import { REVIEW_ERROR_MESSAGES } from './review-errors';
import {
  getChunkProgress as loadChunkProgress,
  getEligibleQueueItems as loadEligibleQueueItems,
  type ChunkProgressSnapshot,
  type ReviewQueueItem,
} from './review-queries';
import {
  buildGradeChunkReviewResult,
  buildNextActionableItem,
  ensureChunkReviewState,
  persistGradeSideEffects,
  type GradeChunkReviewResult,
  type ReviewPersistenceClient,
} from './review-grade';
import { deriveChunkReviewState } from './chunk-progress';
import { findChunkByCardId } from './review-access';
export type { ChunkProgressSnapshot, ReviewQueueItem } from './review-queries';
export type { GradeChunkReviewResult } from './review-grade';
@Injectable()
export class ReviewsService {
  constructor(private readonly prisma: PrismaService) {}

  async getChunkProgress(
    chunkId: string,
    now = new Date(),
  ): Promise<ChunkProgressSnapshot | null> {
    return loadChunkProgress(this.prisma, chunkId, now);
  }

  async getEligibleQueueItems(
    userId: string,
    now = new Date(),
  ): Promise<ReviewQueueItem[]> {
    return loadEligibleQueueItems(this.prisma, userId, now);
  }

  async applyGradeToCard(
    cardId: string,
    grade: Grade,
    userId: string,
    now = new Date(),
  ): Promise<GradeChunkReviewResult | null> {
    const chunk = await findChunkByCardId(this.prisma, cardId, userId);

    if (!chunk) {
      return null;
    }

    const state = await ensureChunkReviewState(this.prisma, chunk.id, now);
    const snapshot = deriveChunkReviewState(chunk, now, state);

    if (!snapshot.isDue || snapshot.currentCard?.cardId !== cardId) {
      return null;
    }

    const currentChunkCard =
      snapshot.currentCard === null
        ? null
        : chunk.chunkCards[snapshot.currentCard.sequenceIndex];

    if (!currentChunkCard?.card) {
      return null;
    }

    const currentCardMode = currentChunkCard.card.kind;

    const wasSuccessful = grade !== 'again';
    const nextConsecutiveSuccessCount = getNextConsecutiveSuccessCount(
      snapshot.consecutiveSuccessCount,
      wasSuccessful,
    );
    const intervalHours =
      grade === 'again'
        ? getChunkReviewIntervalHours(0)
        : getChunkReviewIntervalHours(nextConsecutiveSuccessCount);
    const nextDue = computeNextDueAt(now, intervalHours);

    const existingCardState = await this.prisma.reviewState.findUnique({
      where: { cardId },
    });

    await this.prisma.$transaction(async (tx) => {
      await persistGradeSideEffects(tx as ReviewPersistenceClient, {
        cardId,
        chunkId: chunk.id,
        now,
        nextDue,
        nextConsecutiveSuccessCount,
        grade,
        intervalHours,
        wasSuccessful,
        existingCardState,
        mode: currentCardMode,
      });
    });

    const nextSnapshot = deriveChunkReviewState(chunk, now, {
      ...state,
      due: nextDue,
      consecutiveSuccessCount: nextConsecutiveSuccessCount,
      lastGrade: grade,
      updatedAt: now,
    });
    return buildGradeChunkReviewResult({
      cardId,
      grade,
      wasSuccessful,
      snapshot,
      nextConsecutiveSuccessCount,
      nextDue,
      intervalHours,
      nextActionableItem: buildNextActionableItem(chunk, nextSnapshot),
    });
  }

  async gradeReview(
    cardId: string,
    grade: Grade,
    userId: string,
    now = new Date(),
  ): Promise<GradeChunkReviewResult> {
    const result = await this.applyGradeToCard(cardId, grade, userId, now);

    if (result) {
      return result;
    }

    const chunk = await findChunkByCardId(this.prisma, cardId, userId);

    if (!chunk) {
      throw new NotFoundException(REVIEW_ERROR_MESSAGES.cardNotFound);
    }

    throw new BadRequestException(REVIEW_ERROR_MESSAGES.cardNotReviewable);
  }
}

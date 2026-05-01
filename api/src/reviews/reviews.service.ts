import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import type { Grade } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { REVIEW_ERROR_MESSAGES } from './review-errors';
import {
  getChunkProgress as loadChunkProgress,
  getEligibleQueueItems as loadEligibleQueueItems,
  getPracticeItems as loadPracticeItems,
  type ChunkProgressSnapshot,
  type PracticeItem,
  type ReviewQueueItem,
} from './review-queries';
import type { GradeChunkReviewResult } from './review-grade';
import { canAccessDeck, findChunkByCardId } from './review-access';
import { applyGradeToReviewCard } from './review-grade-application';
import { emitReviewQueueObservability } from './review-service-observability';
export type {
  ChunkProgressSnapshot,
  PracticeItem,
  ReviewQueueItem,
} from './review-queries';
export type { GradeChunkReviewResult } from './review-grade';
@Injectable()
export class ReviewsService {
  private readonly logger = new Logger(ReviewsService.name);

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
    deckId?: string,
  ): Promise<ReviewQueueItem[]> {
    await this.ensureDeckAccess(userId, deckId);
    const items = await loadEligibleQueueItems(
      this.prisma,
      userId,
      now,
      deckId,
    );
    emitReviewQueueObservability({
      logger: this.logger,
      userId,
      items,
      generatedAt: now,
    });

    return items;
  }

  async getPracticeItems(
    userId: string,
    deckId: string,
  ): Promise<PracticeItem[]> {
    await this.ensureDeckAccess(userId, deckId);

    return loadPracticeItems(this.prisma, userId, deckId);
  }

  async applyGradeToCard(
    cardId: string,
    grade: Grade,
    userId: string,
    now = new Date(),
    deckId?: string,
  ): Promise<GradeChunkReviewResult | null> {
    await this.ensureDeckAccess(userId, deckId);

    return applyGradeToReviewCard({
      cardId,
      deckId,
      grade,
      logger: this.logger,
      now,
      prisma: this.prisma,
      userId,
    });
  }

  async gradeReview(
    cardId: string,
    grade: Grade,
    userId: string,
    now = new Date(),
    deckId?: string,
  ): Promise<GradeChunkReviewResult> {
    const result = await this.applyGradeToCard(
      cardId,
      grade,
      userId,
      now,
      deckId,
    );

    if (result) {
      return result;
    }

    const chunk = await findChunkByCardId(this.prisma, cardId, userId, deckId);

    if (!chunk) {
      throw new NotFoundException(REVIEW_ERROR_MESSAGES.cardNotFound);
    }

    throw new BadRequestException(REVIEW_ERROR_MESSAGES.cardNotReviewable);
  }

  private async ensureDeckAccess(
    userId: string,
    deckId?: string,
  ): Promise<void> {
    if (!deckId) {
      return;
    }

    if (!(await canAccessDeck(this.prisma, userId, deckId))) {
      throw new NotFoundException(REVIEW_ERROR_MESSAGES.deckNotFound);
    }
  }
}

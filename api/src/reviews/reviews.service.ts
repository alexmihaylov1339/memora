import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import type { Grade } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CardAssetsService } from '../cards/card-assets.service';
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
import {
  getWhatDidYouHearQuizRoundForDeck,
  submitWhatDidYouHearQuizResultForDeck,
  WHAT_DID_YOU_HEAR_REVIEW_MODE,
  type WhatDidYouHearQuizRoundResult,
  type WhatDidYouHearSubmitResult,
} from './what-did-you-hear/what-did-you-hear-review';
export type {
  ChunkProgressSnapshot,
  PracticeItem,
  ReviewQueueItem,
} from './review-queries';
export type { GradeChunkReviewResult } from './review-grade';
export type {
  WhatDidYouHearQuizRoundResult,
  WhatDidYouHearSubmitResult,
} from './what-did-you-hear/what-did-you-hear-review';
@Injectable()
export class ReviewsService {
  private readonly logger = new Logger(ReviewsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly cardAssets?: CardAssetsService,
  ) {}

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

  async getWhatDidYouHearQuizRound(
    userId: string,
    deckId: string,
    now = new Date(),
    random?: () => number,
  ): Promise<WhatDidYouHearQuizRoundResult> {
    await this.ensureDeckAccess(userId, deckId);

    return getWhatDidYouHearQuizRoundForDeck({
      cardAssets: this.cardAssets,
      deckId,
      now,
      prisma: this.prisma,
      random,
      userId,
    });
  }

  async submitWhatDidYouHearQuizResult(
    userId: string,
    deckId: string,
    cardId: string,
    wrongAttemptCount: number,
    now = new Date(),
  ): Promise<WhatDidYouHearSubmitResult> {
    await this.ensureDeckAccess(userId, deckId);

    return submitWhatDidYouHearQuizResultForDeck({
      applyGrade: (grade) =>
        this.applyGradeToCard(cardId, grade, userId, now, deckId, {
          reviewLogMode: WHAT_DID_YOU_HEAR_REVIEW_MODE,
          skipKindSupportCheck: true,
        }),
      cardAssets: this.cardAssets,
      cardId,
      deckId,
      now,
      prisma: this.prisma,
      userId,
      wrongAttemptCount,
    });
  }

  async applyGradeToCard(
    cardId: string,
    grade: Grade,
    userId: string,
    now = new Date(),
    deckId?: string,
    options: {
      reviewLogMode?: string;
      skipKindSupportCheck?: boolean;
    } = {},
  ): Promise<GradeChunkReviewResult | null> {
    await this.ensureDeckAccess(userId, deckId);

    return applyGradeToReviewCard({
      cardId,
      deckId,
      grade,
      logger: this.logger,
      now,
      prisma: this.prisma,
      reviewLogMode: options.reviewLogMode,
      skipKindSupportCheck: options.skipKindSupportCheck,
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

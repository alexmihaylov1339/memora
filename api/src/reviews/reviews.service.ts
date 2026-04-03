import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { Grade, Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import {
  computeNextDueAt,
  DEFAULT_CHUNK_REQUIRED_CONSECUTIVE_SUCCESSES,
  getCurrentChunkCardIndex,
  getChunkReviewIntervalHours,
  getNextConsecutiveSuccessCount,
  hasChunkMastery,
} from './chunk-scheduling';
import { REVIEW_ERROR_MESSAGES } from './review-errors';

type ChunkWithCards = {
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

type PersistedChunkReviewState = {
  id: string;
  chunkId: string;
  due: Date;
  consecutiveSuccessCount: number;
  lastGrade: Grade | null;
  createdAt: Date;
  updatedAt: Date;
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
  stateCreatedAt: Date;
  stateUpdatedAt: Date;
};

export type ReviewQueueItem = {
  cardId: string;
  deckId: string;
  chunkId: string;
  chunkTitle: string;
  chunkPosition: number;
  positionInChunk: number;
  due: Date;
  kind: string;
  fields: Prisma.JsonValue;
  cardCreatedAt: Date;
  consecutiveSuccessCount: number;
};

export type GradeChunkReviewResult = {
  cardId: string;
  grade: Grade;
  wasSuccessful: boolean;
  advanced: boolean;
  reset: boolean;
  previousConsecutiveSuccessCount: number;
  consecutiveSuccessCount: number;
  due: Date;
  intervalHours: number;
  chunk: ChunkProgressSnapshot;
  nextActionableItem: ReviewQueueItem | null;
};

export type GradeReviewAttempt =
  | {
      status: 'graded';
      result: GradeChunkReviewResult;
    }
  | {
      status: 'not_found';
    }
  | {
      status: 'not_actionable';
    };

@Injectable()
export class ReviewsService {
  private static readonly DEFAULT_EASE = 2.5;

  constructor(private readonly prisma: PrismaService) {}

  private async findChunkWithCards(
    chunkId: string,
  ): Promise<ChunkWithCards | null> {
    return (await this.prisma.chunk.findUnique({
      where: { id: chunkId },
      select: {
        id: true,
        deckId: true,
        title: true,
        position: true,
        chunkCards: {
          orderBy: { sequenceIndex: 'asc' },
          select: {
            cardId: true,
            sequenceIndex: true,
            card: {
              select: {
                id: true,
                kind: true,
                fields: true,
                createdAt: true,
              },
            },
          },
        },
      },
    })) as ChunkWithCards | null;
  }

  private async findChunksWithReviewState(): Promise<ChunkWithCards[]> {
    return (await this.prisma.chunk.findMany({
      select: {
        id: true,
        deckId: true,
        title: true,
        position: true,
        reviewState: {
          select: {
            id: true,
            chunkId: true,
            due: true,
            consecutiveSuccessCount: true,
            lastGrade: true,
            createdAt: true,
            updatedAt: true,
          },
        },
        chunkCards: {
          orderBy: { sequenceIndex: 'asc' },
          select: {
            cardId: true,
            sequenceIndex: true,
            card: {
              select: {
                id: true,
                kind: true,
                fields: true,
                createdAt: true,
              },
            },
          },
        },
      },
    })) as ChunkWithCards[];
  }

  private async findChunkByCardId(
    cardId: string,
  ): Promise<ChunkWithCards | null> {
    return (await this.prisma.chunk.findFirst({
      where: {
        chunkCards: {
          some: { cardId },
        },
      },
      select: {
        id: true,
        deckId: true,
        title: true,
        position: true,
        reviewState: {
          select: {
            id: true,
            chunkId: true,
            due: true,
            consecutiveSuccessCount: true,
            lastGrade: true,
            createdAt: true,
            updatedAt: true,
          },
        },
        chunkCards: {
          orderBy: { sequenceIndex: 'asc' },
          select: {
            cardId: true,
            sequenceIndex: true,
            card: {
              select: {
                id: true,
                kind: true,
                fields: true,
                createdAt: true,
              },
            },
          },
        },
      },
    })) as ChunkWithCards | null;
  }

  private async ensureChunkReviewState(
    chunkId: string,
    now: Date,
  ): Promise<PersistedChunkReviewState> {
    return (await this.prisma.chunkReviewState.upsert({
      where: { chunkId },
      update: {},
      create: {
        chunkId,
        due: now,
        consecutiveSuccessCount: 0,
      },
    })) as PersistedChunkReviewState;
  }

  private deriveChunkReviewState(
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
      requiredConsecutiveSuccesses:
        DEFAULT_CHUNK_REQUIRED_CONSECUTIVE_SUCCESSES,
      hasMastery: hasChunkMastery(state.consecutiveSuccessCount),
      totalCards,
      currentCard: currentCard
        ? {
            cardId: currentCard.cardId,
            sequenceIndex: currentCard.sequenceIndex,
          }
        : null,
      lastGrade: state.lastGrade,
      stateCreatedAt: state.createdAt,
      stateUpdatedAt: state.updatedAt,
    };
  }

  async getChunkProgress(
    chunkId: string,
    now = new Date(),
  ): Promise<ChunkProgressSnapshot | null> {
    const chunk = await this.findChunkWithCards(chunkId);

    if (!chunk) {
      return null;
    }

    const state = await this.ensureChunkReviewState(chunkId, now);
    return this.deriveChunkReviewState(chunk, now, state);
  }

  async getEligibleQueueItems(now = new Date()): Promise<ReviewQueueItem[]> {
    const chunks = await this.findChunksWithReviewState();

    const items = chunks
      .map((chunk) => {
        const snapshot = this.deriveChunkReviewState(chunk, now);
        const currentCard =
          snapshot.currentCard === null
            ? null
            : chunk.chunkCards[snapshot.currentCard.sequenceIndex]?.card;

        if (
          !snapshot.isDue ||
          snapshot.hasMastery ||
          snapshot.currentCard === null ||
          !currentCard
        ) {
          return null;
        }

        return {
          cardId: currentCard.id,
          deckId: chunk.deckId,
          chunkId: chunk.id,
          chunkTitle: chunk.title,
          chunkPosition: chunk.position,
          positionInChunk: snapshot.currentCard.sequenceIndex,
          due: snapshot.due,
          kind: currentCard.kind,
          fields: currentCard.fields,
          cardCreatedAt: currentCard.createdAt,
          consecutiveSuccessCount: snapshot.consecutiveSuccessCount,
        } satisfies ReviewQueueItem;
      })
      .filter((item): item is ReviewQueueItem => item !== null);

    items.sort((left, right) => {
      const dueDiff = left.due.getTime() - right.due.getTime();
      if (dueDiff !== 0) {
        return dueDiff;
      }

      const createdAtDiff =
        left.cardCreatedAt.getTime() - right.cardCreatedAt.getTime();
      if (createdAtDiff !== 0) {
        return createdAtDiff;
      }

      return left.cardId.localeCompare(right.cardId);
    });

    return items;
  }

  async applyGradeToCard(
    cardId: string,
    grade: Grade,
    now = new Date(),
  ): Promise<GradeChunkReviewResult | null> {
    const chunk = await this.findChunkByCardId(cardId);

    if (!chunk) {
      return null;
    }

    const state = await this.ensureChunkReviewState(chunk.id, now);
    const snapshot = this.deriveChunkReviewState(chunk, now, state);

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

    await this.prisma.chunkReviewState.update({
      where: { chunkId: chunk.id },
      data: {
        due: nextDue,
        consecutiveSuccessCount: nextConsecutiveSuccessCount,
        lastGrade: grade,
      },
    });

    await this.prisma.reviewState.upsert({
      where: { cardId },
      update: {
        due: nextDue,
        interval: intervalHours,
        reps: wasSuccessful
          ? existingCardState
            ? existingCardState.reps + 1
            : 1
          : (existingCardState?.reps ?? 0),
        lapses: wasSuccessful
          ? (existingCardState?.lapses ?? 0)
          : (existingCardState?.lapses ?? 0) + 1,
        lastGrade: grade,
      },
      create: {
        cardId,
        ease: ReviewsService.DEFAULT_EASE,
        interval: intervalHours,
        due: nextDue,
        reps: wasSuccessful ? 1 : 0,
        lapses: wasSuccessful ? 0 : 1,
        lastGrade: grade,
      },
    });

    await this.prisma.reviewLog.create({
      data: {
        cardId,
        reviewedAt: now,
        grade,
        oldInterval: existingCardState?.interval ?? 0,
        newInterval: intervalHours,
        oldEase: existingCardState?.ease ?? ReviewsService.DEFAULT_EASE,
        newEase: existingCardState?.ease ?? ReviewsService.DEFAULT_EASE,
        mode: currentChunkCard.card.kind,
        wasCorrect: wasSuccessful,
      },
    });

    const nextSnapshot = this.deriveChunkReviewState(chunk, now, {
      ...state,
      due: nextDue,
      consecutiveSuccessCount: nextConsecutiveSuccessCount,
      lastGrade: grade,
      updatedAt: now,
    });

    const nextChunkCard =
      nextSnapshot.currentCard === null
        ? null
        : chunk.chunkCards[nextSnapshot.currentCard.sequenceIndex];
    const nextActionableItem =
      nextSnapshot.hasMastery ||
      nextSnapshot.currentCard === null ||
      !nextChunkCard?.card
        ? null
        : {
            cardId: nextChunkCard.card.id,
            deckId: chunk.deckId,
            chunkId: chunk.id,
            chunkTitle: chunk.title,
            chunkPosition: chunk.position,
            positionInChunk: nextSnapshot.currentCard.sequenceIndex,
            due: nextSnapshot.due,
            kind: nextChunkCard.card.kind,
            fields: nextChunkCard.card.fields,
            cardCreatedAt: nextChunkCard.card.createdAt,
            consecutiveSuccessCount: nextSnapshot.consecutiveSuccessCount,
          };

    return {
      cardId,
      grade,
      wasSuccessful,
      advanced: wasSuccessful,
      reset: !wasSuccessful,
      previousConsecutiveSuccessCount: snapshot.consecutiveSuccessCount,
      consecutiveSuccessCount: nextConsecutiveSuccessCount,
      due: nextDue,
      intervalHours,
      chunk: nextSnapshot,
      nextActionableItem,
    };
  }

  async gradeReview(
    cardId: string,
    grade: Grade,
    now = new Date(),
  ): Promise<GradeChunkReviewResult> {
    const result = await this.applyGradeToCard(cardId, grade, now);

    if (result) {
      return result;
    }

    const chunk = await this.findChunkByCardId(cardId);

    if (!chunk) {
      throw new NotFoundException(REVIEW_ERROR_MESSAGES.cardNotFound);
    }

    throw new BadRequestException(REVIEW_ERROR_MESSAGES.cardNotReviewable);
  }
}

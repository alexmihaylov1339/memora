import { Injectable } from '@nestjs/common';
import type { Grade, Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import {
  DEFAULT_CHUNK_REQUIRED_CONSECUTIVE_SUCCESSES,
  getCurrentChunkCardIndex,
  hasChunkMastery,
} from './chunk-scheduling';
import type { GradeReviewDto } from './dto/grade-review.dto';

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

@Injectable()
export class ReviewsService {
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
    const state = persistedState ?? chunk.reviewState ?? {
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

  getQueueStub() {
    return {
      module: 'reviews' as const,
      status: 'not_implemented' as const,
      operation: 'queue' as const,
      message: 'Review queue logic will be implemented in Step 4 and Step 5.',
      payload: {
        items: [],
      },
    };
  }

  gradeStub(cardId: string, input: GradeReviewDto) {
    return {
      module: 'reviews' as const,
      status: 'not_implemented' as const,
      operation: 'grade' as const,
      message: 'Review grading logic will be implemented in Step 4 and Step 5.',
      payload: {
        cardId,
        grade: input.grade,
      },
    };
  }
}

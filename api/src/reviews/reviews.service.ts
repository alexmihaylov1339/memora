import { Injectable } from '@nestjs/common';
import type { GradeReviewDto } from './dto/grade-review.dto';
import type { Grade } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import {
  DEFAULT_CHUNK_REQUIRED_CONSECUTIVE_SUCCESSES,
  getCurrentChunkCardIndex,
  hasChunkMastery,
} from './chunk-scheduling';

type ChunkWithCards = {
  id: string;
  deckId: string;
  title: string;
  position: number;
  chunkCards: Array<{
    cardId: string;
    sequenceIndex: number;
  }>;
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

  async getChunkProgress(
    chunkId: string,
    now = new Date(),
  ): Promise<ChunkProgressSnapshot | null> {
    const chunk = await this.findChunkWithCards(chunkId);

    if (!chunk) {
      return null;
    }

    const state = await this.ensureChunkReviewState(chunkId, now);
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

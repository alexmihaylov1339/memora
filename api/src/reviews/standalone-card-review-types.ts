import type { Grade, Prisma } from '@prisma/client';

export interface ApplyGradeToStandaloneCardInput {
  cardId: string;
  deckId?: string;
  grade: Grade;
  now: Date;
  prisma: PrismaServiceLike;
  reviewLogMode?: string;
  userId: string;
}

export interface StandaloneReviewCard {
  id: string;
  deckId: string | null;
  kind: string;
  fields: Prisma.JsonValue;
  createdAt: Date;
  deck: {
    reviewIntervalHours: Prisma.JsonValue | null;
  } | null;
  state: StandaloneReviewState | null;
}

export interface StandaloneReviewState {
  due: Date;
  ease: number;
  interval: number;
  reps: number;
  lapses: number;
  consecutiveSuccessCount: number;
  lastGrade: Grade | null;
}

export interface StandaloneGradePersistenceInput {
  card: StandaloneReviewCard;
  grade: Grade;
  intervalHours: number;
  nextConsecutiveSuccessCount: number;
  nextDue: Date;
  now: Date;
  reviewLogMode?: string;
  state: StandaloneReviewState;
  wasSuccessful: boolean;
}

export type PrismaServiceLike = import('../../prisma/prisma.service').PrismaService;

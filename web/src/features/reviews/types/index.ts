export type ReviewGrade = 'again' | 'hard' | 'good' | 'easy';

export const REVIEW_UNSUPPORTED_REASONS = {
  kindNotReviewEnabled: 'kind_not_review_enabled',
  invalidPayload: 'invalid_payload',
} as const;

export type ReviewUnsupportedReason =
  (typeof REVIEW_UNSUPPORTED_REASONS)[keyof typeof REVIEW_UNSUPPORTED_REASONS];

export interface ReviewQueueItem {
  cardId: string;
  deckId: string;
  chunkId: string;
  chunkTitle: string;
  chunkPosition: number;
  positionInChunk: number;
  due: string;
  kind: string;
  fields: Record<string, unknown>;
  isReviewSupported: boolean;
  reviewUnsupportedReason: ReviewUnsupportedReason | null;
  consecutiveSuccessCount: number;
}

export interface ReviewQueueResponse {
  items: ReviewQueueItem[];
}

export interface ChunkProgressSnapshot {
  chunkId: string;
  deckId: string;
  title: string;
  position: number;
  due: string;
  isDue: boolean;
  consecutiveSuccessCount: number;
  requiredConsecutiveSuccesses: number;
  hasMastery: boolean;
  totalCards: number;
  currentCard: {
    cardId: string;
    sequenceIndex: number;
  } | null;
  lastGrade: ReviewGrade | null;
}

export interface GradeReviewResponse {
  cardId: string;
  grade: ReviewGrade;
  wasSuccessful: boolean;
  advanced: boolean;
  reset: boolean;
  previousConsecutiveSuccessCount: number;
  consecutiveSuccessCount: number;
  due: string;
  intervalHours: number;
  chunk: ChunkProgressSnapshot;
  nextActionableItem: ReviewQueueItem | null;
}

export interface ReviewCardIdParams {
  cardId: string;
}

export interface GradeReviewDto {
  grade: ReviewGrade;
}

import { useCallback, useRef, useState } from 'react';

import type {
  GradeReviewDto,
  GradeReviewResponse,
  ReviewCardIdParams,
  ReviewGrade,
  ReviewQueueItem,
} from '../types';
import { reconcileReviewQueueAfterGrade } from './reviewOptimisticQueue';

export interface FailedGradeRetry {
  cardId: string;
  errorMessage: string;
  grade: ReviewGrade;
}

interface UseFailedGradeRetryInput {
  deckId: string | null;
  gradeReview: (
    input: ReviewCardIdParams & GradeReviewDto,
    callbacks?: {
      onError?: (error: Error) => void;
      onSuccess?: (data: GradeReviewResponse) => void;
    },
  ) => void;
  queueItems: ReviewQueueItem[];
  setLastGradeResult: (result: GradeReviewResponse | null) => void;
  setQueueItemsOverride: (items: ReviewQueueItem[] | undefined) => void;
}

export function getGradeRetryErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }

  return 'The previous grade did not save.';
}

export function useFailedGradeRetry({
  deckId,
  gradeReview,
  queueItems,
  setLastGradeResult,
  setQueueItemsOverride,
}: UseFailedGradeRetryInput) {
  const [failedGradeRetry, setFailedGradeRetry] =
    useState<FailedGradeRetry | null>(null);
  const [isRetryingFailedGrade, setIsRetryingFailedGrade] = useState(false);
  const retryInFlightRef = useRef(false);

  const reportFailedGrade = useCallback(
    (cardId: string, grade: ReviewGrade, error: unknown) => {
      setFailedGradeRetry({
        cardId,
        errorMessage: getGradeRetryErrorMessage(error),
        grade,
      });
    },
    [],
  );

  const clearFailedGradeRetry = useCallback(() => {
    setFailedGradeRetry(null);
  }, []);

  const handleRetryFailedGrade = useCallback(async () => {
    if (!deckId || !failedGradeRetry || retryInFlightRef.current) {
      return;
    }

    retryInFlightRef.current = true;
    setIsRetryingFailedGrade(true);

    gradeReview(
      {
        cardId: failedGradeRetry.cardId,
        deckId,
        grade: failedGradeRetry.grade,
      },
      {
        onError: (error) => {
          retryInFlightRef.current = false;
          setIsRetryingFailedGrade(false);
          setFailedGradeRetry({
            ...failedGradeRetry,
            errorMessage: getGradeRetryErrorMessage(error),
          });
        },
        onSuccess: (result) => {
          const reconciledQueue = reconcileReviewQueueAfterGrade({
            optimisticQueue: queueItems,
            reviewedCardId: failedGradeRetry.cardId,
            serverNextActionableItem: result.nextActionableItem,
          });

          retryInFlightRef.current = false;
          setIsRetryingFailedGrade(false);
          setFailedGradeRetry(null);
          setLastGradeResult(result);
          setQueueItemsOverride(reconciledQueue);
        },
      },
    );
  }, [
    deckId,
    failedGradeRetry,
    gradeReview,
    queueItems,
    setLastGradeResult,
    setQueueItemsOverride,
  ]);

  return {
    clearFailedGradeRetry,
    failedGradeRetry,
    handleRetryFailedGrade,
    isRetryingFailedGrade,
    reportFailedGrade,
  };
}

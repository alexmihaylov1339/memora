import { useCallback, useRef, useState } from 'react';
import type { Dispatch, SetStateAction } from 'react';

import type {
  GradeReviewDto,
  GradeReviewResponse,
  ReviewCardIdParams,
  ReviewGrade,
  ReviewQueueItem,
} from '../types';
import { reconcileReviewQueueAfterGrade } from './reviewOptimisticQueue';

interface GradeReviewCallbacks {
  onError?: (error: Error) => void;
  onSuccess?: (data: GradeReviewResponse) => void;
}

interface UseQueuedGradePersistenceInput {
  clearFailedGradeRetry: () => void;
  deckId: string | null;
  gradeReview: (
    input: ReviewCardIdParams & GradeReviewDto,
    callbacks?: GradeReviewCallbacks,
  ) => void;
  reportFailedGrade: (
    cardId: string,
    grade: ReviewGrade,
    error: unknown,
  ) => void;
  setLastGradeResult: (result: GradeReviewResponse | null) => void;
  setQueueItemsOverride: Dispatch<
    SetStateAction<ReviewQueueItem[] | undefined>
  >;
  setRevealedCardId: (cardId: string | null) => void;
}

interface PersistQueuedGradeInput {
  currentItem: ReviewQueueItem;
  grade: ReviewGrade;
  optimisticQueue: ReviewQueueItem[];
}

export function useQueuedGradePersistence({
  clearFailedGradeRetry,
  deckId,
  gradeReview,
  reportFailedGrade,
  setLastGradeResult,
  setQueueItemsOverride,
  setRevealedCardId,
}: UseQueuedGradePersistenceInput) {
  const [blockingGradeCardId, setBlockingGradeCardId] = useState<string | null>(
    null,
  );
  const pendingGradeChainRef = useRef<Promise<void>>(Promise.resolve());

  const clearBlockingGrade = useCallback(() => {
    setBlockingGradeCardId(null);
  }, []);

  const persistQueuedGrade = useCallback(
    ({ currentItem, grade, optimisticQueue }: PersistQueuedGradeInput) => {
      if (!deckId) {
        return;
      }

      pendingGradeChainRef.current = pendingGradeChainRef.current
        .catch(() => undefined)
        .then(
          () =>
            new Promise<GradeReviewResponse>((resolve, reject) => {
              gradeReview(
                {
                  cardId: currentItem.cardId,
                  deckId,
                  grade,
                },
                {
                  onError: reject,
                  onSuccess: resolve,
                },
              );
            }),
        )
        .then((result) => {
          const reconciledQueue = reconcileReviewQueueAfterGrade({
            optimisticQueue,
            reviewedCardId: currentItem.cardId,
            serverNextActionableItem: result.nextActionableItem,
          });

          clearFailedGradeRetry();
          setLastGradeResult(result);
          setQueueItemsOverride((currentQueue) => {
            if (!currentQueue) {
              return reconciledQueue;
            }

            if (currentQueue.some((item) => item.cardId === currentItem.cardId)) {
              return currentQueue;
            }

            return reconcileReviewQueueAfterGrade({
              optimisticQueue: currentQueue,
              reviewedCardId: currentItem.cardId,
              serverNextActionableItem: result.nextActionableItem,
            });
          });
          setRevealedCardId(null);
        })
        .catch((error: unknown) => {
          reportFailedGrade(currentItem.cardId, grade, error);
        })
        .finally(() => {
          setBlockingGradeCardId((cardId) =>
            cardId === currentItem.cardId ? null : cardId,
          );
        });
    },
    [
      clearFailedGradeRetry,
      deckId,
      gradeReview,
      reportFailedGrade,
      setLastGradeResult,
      setQueueItemsOverride,
      setRevealedCardId,
    ],
  );

  return {
    blockingGradeCardId,
    clearBlockingGrade,
    persistQueuedGrade,
    setBlockingGradeCardId,
  };
}

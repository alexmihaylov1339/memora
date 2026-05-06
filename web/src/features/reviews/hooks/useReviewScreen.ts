import { useCallback, useMemo, useState } from 'react';

import { trackAnalyticsEvent } from '@shared/analytics';
import { resolveReviewRenderer } from '../review-kind-registry';
import type { GradeReviewResponse, ReviewGrade, ReviewQueueItem } from '../types';
import { REVIEW_UI_EVENTS } from '../review-observability';
import {
  moveReviewedItemToQueueEnd,
  removeReviewedItemFromQueue,
} from './reviewOptimisticQueue';
import { useFailedGradeRetry } from './useFailedGradeRetry';
import { useQueuedGradePersistence } from './useQueuedGradePersistence';
import { useGradeReviewMutation } from './useReviewMutations';
import { useReviewQueueQuery } from './useReviewQueries';
import { useReviewScreenObservability } from './useReviewScreenObservability';

export function useReviewScreen(deckId: string | null) {
  const queueQuery = useReviewQueueQuery(deckId);
  const gradeMutation = useGradeReviewMutation();
  const [revealedCardId, setRevealedCardId] = useState<string | null>(null);
  const [queueItemsOverride, setQueueItemsOverride] = useState<
    ReviewQueueItem[] | undefined
  >(undefined);
  const [lastGradeResult, setLastGradeResult] =
    useState<GradeReviewResponse | null>(null);

  const hasQueueError = Boolean(queueQuery.error);
  const missingDeckErrorMessage = deckId ? undefined : 'Choose a deck to review.';
  const queueItems = useMemo(
    () => queueItemsOverride ?? queueQuery.result?.items ?? [],
    [queueItemsOverride, queueQuery.result?.items],
  );
  const currentItem = queueItems.length > 0 ? queueItems[0] : null;
  const queueCount = queueItems.length;
  const reviewRenderer = resolveReviewRenderer(currentItem);
  const isAnswerRevealed = currentItem?.cardId === revealedCardId;
  const gradeErrorMessage = gradeMutation.error?.message;
  const {
    clearFailedGradeRetry,
    failedGradeRetry,
    handleRetryFailedGrade,
    isRetryingFailedGrade,
    reportFailedGrade,
  } = useFailedGradeRetry({
    deckId,
    gradeReview: gradeMutation.grade,
    queueItems,
    setLastGradeResult,
    setQueueItemsOverride,
  });
  const {
    blockingGradeCardId,
    clearBlockingGrade,
    persistQueuedGrade,
    setBlockingGradeCardId,
  } = useQueuedGradePersistence({
    clearFailedGradeRetry,
    deckId,
    gradeReview: gradeMutation.grade,
    reportFailedGrade,
    setLastGradeResult,
    setQueueItemsOverride,
    setRevealedCardId,
  });
  const isVisibleCardSaving = currentItem?.cardId === blockingGradeCardId;

  useReviewScreenObservability({
    currentItem,
    hasQueueError,
    isLoading: queueQuery.isLoading,
    lastGradeResult,
    queueCount,
    reviewRenderer,
  });

  const handleRevealAnswer = useCallback(() => {
    if (!currentItem) {
      return;
    }
    setRevealedCardId(currentItem.cardId);
  }, [currentItem]);

  const handleGrade = useCallback((grade: ReviewGrade) => {
    if (!currentItem || !deckId) {
      return;
    }

    trackAnalyticsEvent(REVIEW_UI_EVENTS.gradeClicked, {
      cardId: currentItem.cardId,
      kind: currentItem.kind,
      grade,
      queueCount,
      positionInChunk: currentItem.positionInChunk,
    });

    const isImmediateRetry = grade === 'again';
    const optimisticQueue = isImmediateRetry
      ? moveReviewedItemToQueueEnd(queueItems, currentItem.cardId)
      : removeReviewedItemFromQueue(queueItems, currentItem.cardId);
    const hasOptimisticNext =
      optimisticQueue.length > 0 &&
      optimisticQueue[0]?.cardId !== currentItem.cardId;
    if (hasOptimisticNext) {
      setQueueItemsOverride(optimisticQueue);
      setRevealedCardId(null);
      setBlockingGradeCardId(null);
    } else {
      setBlockingGradeCardId(currentItem.cardId);
    }

    persistQueuedGrade({ currentItem, grade, optimisticQueue });
  }, [
    currentItem,
    deckId,
    persistQueuedGrade,
    queueCount,
    queueItems,
    setBlockingGradeCardId,
  ]);

  const handleRefreshQueue = useCallback(async () => {
    clearFailedGradeRetry();
    clearBlockingGrade();
    setQueueItemsOverride(undefined);
    setLastGradeResult(null);
    setRevealedCardId(null);
    await queueQuery.refetch();
  }, [clearBlockingGrade, clearFailedGradeRetry, queueQuery]);

  return {
    currentItem,
    deckId,
    errorMessage: missingDeckErrorMessage ?? queueQuery.error?.message,
    failedGradeRetry,
    gradeErrorMessage,
    gradeResult: lastGradeResult,
    reviewRenderer,
    isGrading: gradeMutation.isLoading && isVisibleCardSaving,
    isAnswerRevealed,
    isLoading: queueQuery.isLoading,
    isRetryingFailedGrade,
    queueCount,
    handleGrade,
    handleRevealAnswer,
    handleRefreshQueue,
    handleRetryFailedGrade,
  };
}

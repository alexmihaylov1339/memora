import { useCallback, useMemo, useState } from 'react';

import { trackAnalyticsEvent } from '@shared/analytics';
import { resolveReviewRenderer } from '../review-kind-registry';
import type { GradeReviewResponse, ReviewGrade, ReviewQueueItem } from '../types';
import { REVIEW_UI_EVENTS } from '../review-observability';
import {
  reconcileReviewQueueAfterGrade,
  removeReviewedItemFromQueue,
} from './reviewOptimisticQueue';
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
  const currentItem = useMemo<ReviewQueueItem | null>(
    () => (queueItems.length > 0 ? queueItems[0] : null),
    [queueItems],
  );
  const queueCount = queueItems.length;
  const reviewRenderer = resolveReviewRenderer(currentItem);
  const isAnswerRevealed = currentItem?.cardId === revealedCardId;
  const gradeErrorMessage = gradeMutation.error?.message;

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

  const handleGrade = useCallback(async (grade: ReviewGrade) => {
    if (!currentItem) {
      return;
    }
    if (!deckId) {
      return;
    }
    const scopedDeckId = deckId;

    trackAnalyticsEvent(REVIEW_UI_EVENTS.gradeClicked, {
      cardId: currentItem.cardId,
      kind: currentItem.kind,
      grade,
      queueCount,
      positionInChunk: currentItem.positionInChunk,
    });

    const optimisticQueue = removeReviewedItemFromQueue(
      queueItems,
      currentItem.cardId,
    );
    if (optimisticQueue.length > 0) {
      setQueueItemsOverride(optimisticQueue);
      setRevealedCardId(null);
    }

    const result = await gradeMutation.fetch({
      cardId: currentItem.cardId,
      deckId: scopedDeckId,
      grade,
    });
    const reconciledQueue = reconcileReviewQueueAfterGrade({
      optimisticQueue,
      reviewedCardId: currentItem.cardId,
      serverNextActionableItem: result.nextActionableItem,
    });

    setLastGradeResult(result);
    setQueueItemsOverride(reconciledQueue);
    setRevealedCardId(null);
  }, [currentItem, deckId, gradeMutation, queueCount, queueItems]);

  const handleRefreshQueue = useCallback(async () => {
    setQueueItemsOverride(undefined);
    setLastGradeResult(null);
    setRevealedCardId(null);
    await queueQuery.refetch();
  }, [queueQuery]);

  return {
    currentItem,
    deckId,
    errorMessage: missingDeckErrorMessage ?? queueQuery.error?.message,
    gradeErrorMessage,
    gradeResult: lastGradeResult,
    reviewRenderer,
    isGrading: gradeMutation.isLoading,
    isAnswerRevealed,
    isLoading: queueQuery.isLoading,
    queueCount,
    handleGrade,
    handleRevealAnswer,
    handleRefreshQueue,
  };
}

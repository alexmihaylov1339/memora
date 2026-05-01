import { useCallback, useMemo, useState } from 'react';

import { trackAnalyticsEvent } from '@shared/analytics';
import { resolveReviewRenderer } from '../review-kind-registry';
import type { GradeReviewResponse, ReviewGrade, ReviewQueueItem } from '../types';
import { REVIEW_UI_EVENTS } from '../review-observability';
import { useGradeReviewMutation } from './useReviewMutations';
import { useReviewQueueQuery } from './useReviewQueries';
import { useReviewScreenObservability } from './useReviewScreenObservability';

export function useReviewScreen(deckId: string | null) {
  const queueQuery = useReviewQueueQuery(deckId);
  const gradeMutation = useGradeReviewMutation();
  const [revealedCardId, setRevealedCardId] = useState<string | null>(null);
  const [currentItemOverride, setCurrentItemOverride] = useState<
    ReviewQueueItem | null | undefined
  >(undefined);
  const [lastGradeResult, setLastGradeResult] =
    useState<GradeReviewResponse | null>(null);

  const hasQueueError = Boolean(queueQuery.error);
  const missingDeckErrorMessage = deckId ? undefined : 'Choose a deck to review.';
  const currentItem = useMemo(
    () =>
      currentItemOverride === undefined
        ? queueQuery.result?.items[0] ?? null
        : currentItemOverride,
    [currentItemOverride, queueQuery.result?.items],
  );
  const queueCount = useMemo(() => queueQuery.result?.items.length ?? 0, [
    queueQuery.result?.items,
  ]);
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

    const fallbackNextItem =
      queueQuery.result?.items.find((item) => item.cardId !== currentItem.cardId) ??
      null;
    const result = await gradeMutation.fetch({
      cardId: currentItem.cardId,
      deckId: scopedDeckId,
      grade,
    });
    const nextItem =
      result.nextActionableItem?.cardId === currentItem.cardId
        ? fallbackNextItem
        : result.nextActionableItem ?? fallbackNextItem;

    setLastGradeResult(result);
    setCurrentItemOverride(nextItem);
    setRevealedCardId(null);
  }, [currentItem, deckId, gradeMutation, queueCount, queueQuery.result?.items]);

  const handleRefreshQueue = useCallback(async () => {
    setCurrentItemOverride(undefined);
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

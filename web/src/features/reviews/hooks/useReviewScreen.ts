import { useState } from 'react';

import { getBasicReviewCardFields } from '../reviewCardFields';
import type { GradeReviewResponse, ReviewGrade, ReviewQueueItem } from '../types';
import { useGradeReviewMutation } from './useReviewMutations';
import { useReviewQueueQuery } from './useReviewQueries';

export function useReviewScreen() {
  const queueQuery = useReviewQueueQuery();
  const gradeMutation = useGradeReviewMutation();
  const [revealedCardId, setRevealedCardId] = useState<string | null>(null);
  const [currentItemOverride, setCurrentItemOverride] = useState<
    ReviewQueueItem | null | undefined
  >(undefined);
  const [lastGradeResult, setLastGradeResult] =
    useState<GradeReviewResponse | null>(null);

  const currentItem =
    currentItemOverride === undefined
      ? queueQuery.result?.items[0] ?? null
      : currentItemOverride;
  const queueCount = queueQuery.result?.items.length ?? 0;
  const basicCardFields = getBasicReviewCardFields(currentItem);
  const isAnswerRevealed = currentItem?.cardId === revealedCardId;
  const gradeErrorMessage = gradeMutation.error?.message;

  function handleRevealAnswer() {
    if (!currentItem) {
      return;
    }

    setRevealedCardId(currentItem.cardId);
  }

  async function handleGrade(grade: ReviewGrade) {
    if (!currentItem) {
      return;
    }

    const result = await gradeMutation.fetch({
      cardId: currentItem.cardId,
      grade,
    });

    setLastGradeResult(result);
    setCurrentItemOverride(result.nextActionableItem);
    setRevealedCardId(null);
  }

  async function handleRefreshQueue() {
    setCurrentItemOverride(undefined);
    setLastGradeResult(null);
    setRevealedCardId(null);
    await queueQuery.refetch();
  }

  return {
    basicCardFields,
    currentItem,
    errorMessage: queueQuery.error?.message,
    gradeErrorMessage,
    gradeResult: lastGradeResult,
    isGrading: gradeMutation.isLoading,
    isAnswerRevealed,
    isLoading: queueQuery.isLoading,
    queueCount,
    handleGrade,
    handleRevealAnswer,
    handleRefreshQueue,
  };
}

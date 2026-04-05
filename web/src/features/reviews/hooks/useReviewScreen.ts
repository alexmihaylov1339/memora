import { useState } from 'react';

import { getBasicReviewCardFields } from '../reviewCardFields';
import { useReviewQueueQuery } from './useReviewQueries';

export function useReviewScreen() {
  const queueQuery = useReviewQueueQuery();
  const [revealedCardId, setRevealedCardId] = useState<string | null>(null);

  const currentItem = queueQuery.result?.items[0] ?? null;
  const queueCount = queueQuery.result?.items.length ?? 0;
  const basicCardFields = getBasicReviewCardFields(currentItem);
  const isAnswerRevealed = currentItem?.cardId === revealedCardId;

  function handleRevealAnswer() {
    if (!currentItem) {
      return;
    }

    setRevealedCardId(currentItem.cardId);
  }

  return {
    basicCardFields,
    currentItem,
    errorMessage: queueQuery.error?.message,
    isAnswerRevealed,
    isLoading: queueQuery.isLoading,
    queueCount,
    refetchQueue: queueQuery.refetch,
    handleRevealAnswer,
  };
}

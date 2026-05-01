import { useMemo, useState } from 'react';

import { resolveReviewRenderer } from '../review-kind-registry';
import type { ReviewRenderableItem } from '../types';
import { usePracticeQuery } from './useReviewQueries';

export function usePracticeScreen(deckId: string | null) {
  const practiceQuery = usePracticeQuery(deckId);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [revealedCardId, setRevealedCardId] = useState<string | null>(null);

  const items = practiceQuery.result?.items ?? [];
  const currentItem = items[currentIndex] ?? null;
  const reviewRenderer = resolveReviewRenderer(currentItem);
  const isAnswerRevealed = currentItem?.cardId === revealedCardId;
  const missingDeckErrorMessage = deckId ? undefined : 'Choose a deck to practice.';

  const hasPreviousItem = currentIndex > 0;
  const hasNextItem = currentIndex < items.length - 1;

  const positionLabel = useMemo(() => {
    if (items.length === 0) {
      return '0 of 0';
    }

    return `${currentIndex + 1} of ${items.length}`;
  }, [currentIndex, items.length]);

  function handleRevealAnswer() {
    if (!currentItem) {
      return;
    }

    setRevealedCardId(currentItem.cardId);
  }

  function handlePreviousItem() {
    if (!hasPreviousItem) {
      return;
    }

    setCurrentIndex((index) => index - 1);
    setRevealedCardId(null);
  }

  function handleNextItem() {
    if (!hasNextItem) {
      return;
    }

    setCurrentIndex((index) => index + 1);
    setRevealedCardId(null);
  }

  return {
    currentItem: currentItem as ReviewRenderableItem | null,
    errorMessage: missingDeckErrorMessage ?? practiceQuery.error?.message,
    hasNextItem,
    hasPreviousItem,
    isAnswerRevealed,
    isLoading: practiceQuery.isLoading,
    positionLabel,
    reviewRenderer,
    totalCount: items.length,
    handleNextItem,
    handlePreviousItem,
    handleRevealAnswer,
  };
}

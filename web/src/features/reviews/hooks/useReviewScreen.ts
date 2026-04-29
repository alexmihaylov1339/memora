import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { trackAnalyticsEvent } from '@shared/analytics';
import { resolveReviewRenderer } from '../review-kind-registry';
import type { GradeReviewResponse, ReviewGrade, ReviewQueueItem } from '../types';
import {
  REVIEW_QUEUE_STATES,
  REVIEW_UI_EVENTS,
  resolveUnsupportedReason,
  type ReviewQueueState,
} from '../review-observability';
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
  const lastUnsupportedKeyRef = useRef<string | null>(null);
  const lastQueueStateRef = useRef<ReviewQueueState | null>(null);

  const hasQueueError = Boolean(queueQuery.error);
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

  useEffect(() => {
    if (queueQuery.isLoading || hasQueueError) {
      return;
    }

    if (!currentItem && !lastGradeResult) {
      if (lastQueueStateRef.current === REVIEW_QUEUE_STATES.empty) {
        return;
      }
      lastQueueStateRef.current = REVIEW_QUEUE_STATES.empty;
      trackAnalyticsEvent(REVIEW_UI_EVENTS.queueStateChanged, {
        state: REVIEW_QUEUE_STATES.empty,
        queueCount,
      });
      return;
    }

    if (!currentItem && lastGradeResult) {
      if (lastQueueStateRef.current === REVIEW_QUEUE_STATES.complete) {
        return;
      }
      lastQueueStateRef.current = REVIEW_QUEUE_STATES.complete;
      trackAnalyticsEvent(REVIEW_UI_EVENTS.queueStateChanged, {
        state: REVIEW_QUEUE_STATES.complete,
        queueCount,
      });
      return;
    }

    lastQueueStateRef.current = null;
  }, [
    currentItem,
    lastGradeResult,
    queueCount,
    hasQueueError,
    queueQuery.isLoading,
  ]);

  useEffect(() => {
    if (!currentItem || !reviewRenderer || reviewRenderer.renderer !== 'unsupported') {
      lastUnsupportedKeyRef.current = null;
      return;
    }

    const reason = resolveUnsupportedReason(
      reviewRenderer.reason ?? currentItem.reviewUnsupportedReason,
    );
    const eventKey = `${currentItem.cardId}:${reason}`;
    if (lastUnsupportedKeyRef.current === eventKey) {
      return;
    }

    lastUnsupportedKeyRef.current = eventKey;
    trackAnalyticsEvent(REVIEW_UI_EVENTS.unsupportedSeen, {
      cardId: currentItem.cardId,
      kind: currentItem.kind,
      reason,
      queuePosition: currentItem.positionInChunk,
      queueCount,
    });
  }, [currentItem, queueCount, reviewRenderer]);

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
      grade,
    });
    const nextItem =
      result.nextActionableItem?.cardId === currentItem.cardId
        ? fallbackNextItem
        : result.nextActionableItem ?? fallbackNextItem;

    setLastGradeResult(result);
    setCurrentItemOverride(nextItem);
    setRevealedCardId(null);
  }, [currentItem, gradeMutation, queueCount, queueQuery.result?.items]);

  const handleRefreshQueue = useCallback(async () => {
    setCurrentItemOverride(undefined);
    setLastGradeResult(null);
    setRevealedCardId(null);
    await queueQuery.refetch();
  }, [queueQuery]);

  return {
    currentItem,
    errorMessage: queueQuery.error?.message,
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

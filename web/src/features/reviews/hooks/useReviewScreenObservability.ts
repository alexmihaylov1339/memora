import { useEffect, useRef, type MutableRefObject } from 'react';

import { trackAnalyticsEvent } from '@shared/analytics';
import type { ReviewRendererResolution } from '../review-kind-registry';
import type { GradeReviewResponse, ReviewQueueItem } from '../types';
import {
  REVIEW_QUEUE_STATES,
  REVIEW_UI_EVENTS,
  resolveUnsupportedReason,
  type ReviewQueueState,
} from '../review-observability';

interface UseReviewScreenObservabilityInput {
  currentItem: ReviewQueueItem | null;
  hasQueueError: boolean;
  isLoading: boolean;
  lastGradeResult: GradeReviewResponse | null;
  queueCount: number;
  reviewRenderer: ReviewRendererResolution | null;
}

export function useReviewScreenObservability({
  currentItem,
  hasQueueError,
  isLoading,
  lastGradeResult,
  queueCount,
  reviewRenderer,
}: UseReviewScreenObservabilityInput) {
  const lastUnsupportedKeyRef = useRef<string | null>(null);
  const lastQueueStateRef = useRef<ReviewQueueState | null>(null);

  useEffect(() => {
    if (isLoading || hasQueueError) {
      return;
    }

    if (!currentItem && !lastGradeResult) {
      trackQueueStateOnce(lastQueueStateRef, REVIEW_QUEUE_STATES.empty, queueCount);
      return;
    }

    if (!currentItem && lastGradeResult) {
      trackQueueStateOnce(
        lastQueueStateRef,
        REVIEW_QUEUE_STATES.complete,
        queueCount,
      );
      return;
    }

    lastQueueStateRef.current = null;
  }, [currentItem, lastGradeResult, queueCount, hasQueueError, isLoading]);

  useEffect(() => {
    if (
      !currentItem ||
      !reviewRenderer ||
      reviewRenderer.renderer !== 'unsupported'
    ) {
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
}

function trackQueueStateOnce(
  stateRef: MutableRefObject<ReviewQueueState | null>,
  state: ReviewQueueState,
  queueCount: number,
): void {
  if (stateRef.current === state) {
    return;
  }

  stateRef.current = state;
  trackAnalyticsEvent(REVIEW_UI_EVENTS.queueStateChanged, {
    state,
    queueCount,
  });
}

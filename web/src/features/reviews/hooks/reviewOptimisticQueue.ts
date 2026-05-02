import type { ReviewQueueItem } from '../types';

interface ReconcileReviewQueueInput {
  optimisticQueue: ReviewQueueItem[];
  reviewedCardId: string;
  serverNextActionableItem: ReviewQueueItem | null;
}

export function removeReviewedItemFromQueue(
  items: ReviewQueueItem[],
  reviewedCardId: string,
): ReviewQueueItem[] {
  return items.filter((item) => item.cardId !== reviewedCardId);
}

export function moveReviewedItemToQueueEnd(
  items: ReviewQueueItem[],
  reviewedCardId: string,
): ReviewQueueItem[] {
  const reviewedItem = items.find((item) => item.cardId === reviewedCardId);

  if (!reviewedItem) {
    return items;
  }

  return [
    ...items.filter((item) => item.cardId !== reviewedCardId),
    reviewedItem,
  ];
}

export function reconcileReviewQueueAfterGrade({
  optimisticQueue,
  reviewedCardId,
  serverNextActionableItem,
}: ReconcileReviewQueueInput): ReviewQueueItem[] {
  if (
    !serverNextActionableItem ||
    serverNextActionableItem.cardId === reviewedCardId
  ) {
    return optimisticQueue;
  }

  const existingServerNextIndex = optimisticQueue.findIndex(
    (item) => item.cardId === serverNextActionableItem.cardId,
  );
  if (existingServerNextIndex >= 0) {
    return optimisticQueue;
  }

  const [visibleItem, ...remainingItems] = optimisticQueue;
  if (!visibleItem) {
    return [serverNextActionableItem];
  }

  return [visibleItem, serverNextActionableItem, ...remainingItems];
}

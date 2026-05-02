import type { ReviewQueueItem } from '../types';
import {
  reconcileReviewQueueAfterGrade,
  removeReviewedItemFromQueue,
} from './reviewOptimisticQueue';

function buildQueueItem(cardId: string): ReviewQueueItem {
  return {
    cardId,
    deckId: 'deck-1',
    chunkId: 'chunk-1',
    chunkTitle: 'spielen',
    chunkPosition: 0,
    positionInChunk: 0,
    due: '2026-04-26T10:00:00.000Z',
    kind: 'basic',
    fields: { front: cardId, back: cardId },
    isReviewSupported: true,
    reviewUnsupportedReason: null,
    consecutiveSuccessCount: 0,
  };
}

describe('reviewOptimisticQueue', () => {
  it('removes the reviewed item from the local queue', () => {
    expect(
      removeReviewedItemFromQueue(
        [buildQueueItem('card-1'), buildQueueItem('card-2')],
        'card-1',
      ),
    ).toEqual([buildQueueItem('card-2')]);
  });

  it('keeps the visible optimistic item and inserts a different server next item after it', () => {
    const optimisticQueue = [buildQueueItem('card-2')];

    expect(
      reconcileReviewQueueAfterGrade({
        optimisticQueue,
        reviewedCardId: 'card-1',
        serverNextActionableItem: buildQueueItem('card-3'),
      }),
    ).toEqual([buildQueueItem('card-2'), buildQueueItem('card-3')]);
  });

  it('does not re-add the reviewed card when the server reports an immediate retry', () => {
    const optimisticQueue = [buildQueueItem('card-2')];

    expect(
      reconcileReviewQueueAfterGrade({
        optimisticQueue,
        reviewedCardId: 'card-1',
        serverNextActionableItem: buildQueueItem('card-1'),
      }),
    ).toEqual(optimisticQueue);
  });
});

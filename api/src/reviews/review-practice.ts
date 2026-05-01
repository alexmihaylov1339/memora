import type { ChunkWithCards } from './chunk-progress';
import { resolveReviewKindSupport } from './review-kind-adapter';
import type { PracticeItem } from './review-queue';

export function buildPracticeItems(chunks: ChunkWithCards[]): PracticeItem[] {
  const items: PracticeItem[] = [];
  const seenCardIds = new Set<string>();

  for (const chunk of chunks) {
    for (const chunkCard of chunk.chunkCards) {
      const card = chunkCard.card;

      if (!card || seenCardIds.has(card.id)) {
        continue;
      }

      seenCardIds.add(card.id);
      const reviewKindSupport = resolveReviewKindSupport(
        card.kind,
        card.fields,
      );

      items.push({
        cardId: card.id,
        deckId: chunk.deckId,
        chunkId: chunk.id,
        chunkTitle: chunk.title,
        chunkPosition: chunk.position,
        positionInChunk: chunkCard.sequenceIndex,
        kind: card.kind,
        fields: card.fields,
        isReviewSupported: reviewKindSupport.isReviewSupported,
        reviewUnsupportedReason: reviewKindSupport.reviewUnsupportedReason,
        cardCreatedAt: card.createdAt,
      });
    }
  }

  return items;
}

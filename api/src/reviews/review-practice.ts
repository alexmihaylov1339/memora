import type { Prisma } from '@prisma/client';
import type { ChunkWithCards } from './chunk-progress';
import { resolveReviewKindSupport } from './review-kind-adapter';
import type { PracticeItem } from './review-queue';

export interface StandalonePracticeCard {
  id: string;
  deckId: string;
  kind: string;
  fields: Prisma.JsonValue;
  createdAt: Date;
  deckCardCreatedAt: Date;
}

export function buildPracticeItems(
  chunks: ChunkWithCards[],
  standaloneCards: StandalonePracticeCard[] = [],
): PracticeItem[] {
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

  for (const card of standaloneCards) {
    if (seenCardIds.has(card.id)) {
      continue;
    }

    seenCardIds.add(card.id);
    const reviewKindSupport = resolveReviewKindSupport(
      card.kind,
      card.fields,
    );

    items.push({
      cardId: card.id,
      deckId: card.deckId,
      chunkId: `standalone:${card.id}`,
      chunkTitle: 'Standalone Card',
      chunkPosition: Number.MAX_SAFE_INTEGER,
      positionInChunk: items.length,
      kind: card.kind,
      fields: card.fields,
      isReviewSupported: reviewKindSupport.isReviewSupported,
      reviewUnsupportedReason: reviewKindSupport.reviewUnsupportedReason,
      cardCreatedAt: card.createdAt,
    });
  }

  return items;
}

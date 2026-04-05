import type { CardRecord } from '@features/decks';

const CARD_LABEL_FALLBACK_PREFIX = 'Card';
const MAX_CHUNK_CARD_PREVIEW_LENGTH = 42;

export function getChunkCardLabel(
  cardId: string,
  cardsById: Map<string, CardRecord>,
): string {
  const card = cardsById.get(cardId);
  if (!card) {
    return `${CARD_LABEL_FALLBACK_PREFIX} ${cardId}`;
  }

  const front = card.fields.front;
  if (typeof front !== 'string') {
    return `${CARD_LABEL_FALLBACK_PREFIX} ${cardId}`;
  }

  const normalized = front.trim();
  if (!normalized) {
    return `${CARD_LABEL_FALLBACK_PREFIX} ${cardId}`;
  }

  if (normalized.length <= MAX_CHUNK_CARD_PREVIEW_LENGTH) {
    return normalized;
  }

  return `${normalized.slice(0, MAX_CHUNK_CARD_PREVIEW_LENGTH - 1)}...`;
}

import type { CardRecord } from '@features/decks';
import { SEARCH_ENTITY_TYPES, type SearchResultItem } from '@features/search';
import { isString } from '@/shared/utils';

export interface ChunkCardPreview {
  front: string;
  back?: string;
}

export function getChunkCardPreview(card: CardRecord): ChunkCardPreview {
  const front = card.fields.front;
  const back = card.fields.back;

  if (isString(front) && front.trim()) {
    return {
      front: front.trim(),
      back: isString(back) && back.trim() ? back.trim() : undefined,
    };
  }

  return {
    front: `Card ${card.id}`,
    back: 'Preview is only available for cards with readable text fields.',
  };
}

export function mapChunkCardToSearchResultItem(card: CardRecord): SearchResultItem {
  const preview = getChunkCardPreview(card);

  return {
    id: card.id,
    type: SEARCH_ENTITY_TYPES.card,
    label: preview.front,
    description: preview.back,
  };
}

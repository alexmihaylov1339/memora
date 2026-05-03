import { getCardPreview, type CardRecord } from '@features/decks';
import { SEARCH_ENTITY_TYPES, type SearchResultItem } from '@features/search';

export interface ChunkCardPreview {
  front: string;
  back?: string;
}

export function getChunkCardPreview(card: CardRecord): ChunkCardPreview {
  return getCardPreview(card);
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

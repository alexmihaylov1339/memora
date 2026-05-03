import { getCardPreview, type CardRecord } from '@features/decks';
import type { ChunkRecord } from '@features/chunks';
import { SEARCH_ENTITY_TYPES, type SearchResultItem } from '@features/search';

export function cardToSearchResultItem(card: CardRecord): SearchResultItem {
  const preview = getCardPreview(card);

  return {
    id: card.id,
    type: SEARCH_ENTITY_TYPES.card,
    label: preview.front,
    description: preview.back || card.kind,
  };
}

export function chunkToSearchResultItem(chunk: ChunkRecord): SearchResultItem {
  return {
    id: chunk.id,
    type: SEARCH_ENTITY_TYPES.chunk,
    label: chunk.title,
  };
}

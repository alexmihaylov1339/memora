import type { CardRecord } from '@features/decks';
import type { ChunkRecord } from '@features/chunks';
import { SEARCH_ENTITY_TYPES, type SearchResultItem } from '@features/search';

export function cardToSearchResultItem(card: CardRecord): SearchResultItem {
  const fields = card.fields as { front?: string; back?: string };

  return {
    id: card.id,
    type: SEARCH_ENTITY_TYPES.card,
    label: fields.front?.trim() || 'Untitled card',
    description: fields.back?.trim() || card.kind,
  };
}

export function chunkToSearchResultItem(chunk: ChunkRecord): SearchResultItem {
  return {
    id: chunk.id,
    type: SEARCH_ENTITY_TYPES.chunk,
    label: chunk.title,
  };
}

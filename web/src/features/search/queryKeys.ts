import { SEARCH_ENTITY_TYPES } from './types';

export const SEARCH_QUERY_KEYS = {
  all: ['search'] as const,
  deck: ['search', SEARCH_ENTITY_TYPES.deck] as const,
  card: ['search', SEARCH_ENTITY_TYPES.card] as const,
  chunk: ['search', SEARCH_ENTITY_TYPES.chunk] as const,
};

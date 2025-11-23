/**
 * Base key for deck queries
 */
const DECKS_KEY = 'decks';

/**
 * Query keys for TanStack Query caching
 */
export const DECKS_QUERY_KEYS = {
  all: [DECKS_KEY],
  detail: (id: string) => [DECKS_KEY, id],
};

export { createDeckFormFields } from './formFields';
export { DECK_ENDPOINTS } from './endpoints';


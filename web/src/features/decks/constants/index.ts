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

export const DECK_SELECTED_ITEMS_PAGE_SIZE = 5;
export const CARD_LIBRARY_PICKER_PAGE_SIZE = 6;

export { createDeckFormFields } from './formFields';
export { DECK_ENDPOINTS } from './endpoints';

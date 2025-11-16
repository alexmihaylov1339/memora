/**
 * Query keys for TanStack Query caching
 */
export const DECKS_QUERY_KEYS = {
  all: ['decks'],
  detail: (id: string) => ['decks', id],
};

export { createDeckFormFields } from './formFields';


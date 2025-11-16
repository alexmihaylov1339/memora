/**
 * API endpoints for deck operations
 */
export const DECK_ENDPOINTS = {
  BASE: '/v1/decks',
  DETAIL: (id: string) => `/v1/decks/${id}`,
} as const;


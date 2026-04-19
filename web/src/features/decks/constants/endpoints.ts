/**
 * API endpoints for deck operations
 */
export const DECK_ENDPOINTS = {
  BASE: '/v1/decks',
  DETAIL: (id: string) => `/v1/decks/${id}`,
  SHARES: (id: string) => `/v1/decks/${id}/shares`,
  SHARE: (id: string, sharedUserId: string) =>
    `/v1/decks/${id}/shares/${sharedUserId}`,
} as const;

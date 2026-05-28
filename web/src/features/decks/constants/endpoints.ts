/**
 * API endpoints for deck operations
 */
export const DECK_ENDPOINTS = {
  BASE: '/v1/decks',
  PUBLIC: '/v1/decks/public',
  PUBLIC_COPY: (id: string) => `/v1/decks/public/${id}/copy`,
  PUBLICATION: (id: string) => `/v1/decks/${id}/publication`,
  DETAIL: (id: string) => `/v1/decks/${id}`,
  SHARES: (id: string) => `/v1/decks/${id}/shares`,
  SHARE: (id: string, sharedUserId: string) =>
    `/v1/decks/${id}/shares/${sharedUserId}`,
} as const;

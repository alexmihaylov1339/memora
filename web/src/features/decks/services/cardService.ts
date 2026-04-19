import { ManageService, HTTP_METHODS, getAuthHeaders } from '@shared/services';
import type {
  CardRecord,
  DeckCardMembershipMutationResult,
  DeckMoveCandidatesParams,
  MoveDeckCardsParams,
} from '../types';
import type { SearchRequest, SearchResultItem } from '../../search/types';

interface CardPayload {
  deckId: string;
  kind: string;
  fields: Record<string, unknown>;
}

interface UpdateCardPayload {
  id: string;
  kind?: string;
  fields?: Record<string, unknown>;
}

interface CardIdPayload {
  id: string;
}

export const CARD_KIND_OPTIONS = ['basic', 'cloze', 'mcq'] as const;

const API_URL = process.env.NEXT_PUBLIC_API_URL || '';
const api = ManageService(API_URL);

const CARD_ENDPOINTS = {
  BASE: '/v1/cards',
  DETAIL: (id: string) => `/v1/cards/${id}`,
  MOVE_CANDIDATES: (deckId: string) => `/v1/decks/${deckId}/move-candidates/cards`,
  MOVE: (deckId: string) => `/v1/decks/${deckId}/move/cards`,
} as const;
const SEARCH_ENDPOINTS = {
  BASE: '/v1/search',
} as const;

export const cardService = {
  create(params: CardPayload) {
    return api
      .prepareRequest(CARD_ENDPOINTS.BASE, HTTP_METHODS.POST)
      .setHeaders(getAuthHeaders())
      .setBody(params)
      .execRequest<CardRecord>();
  },

  getById(params: CardIdPayload) {
    return api
      .prepareRequest(CARD_ENDPOINTS.DETAIL(params.id), HTTP_METHODS.GET)
      .setHeaders(getAuthHeaders())
      .execRequest<CardRecord>();
  },

  getAll() {
    return api
      .prepareRequest(CARD_ENDPOINTS.BASE, HTTP_METHODS.GET)
      .setHeaders(getAuthHeaders())
      .execRequest<CardRecord[]>();
  },

  getMoveCandidates(params: DeckMoveCandidatesParams) {
    return api
      .prepareRequest(CARD_ENDPOINTS.MOVE_CANDIDATES(params.deckId), HTTP_METHODS.GET)
      .setHeaders(getAuthHeaders())
      .execRequest<CardRecord[]>();
  },

  moveToDeck(params: MoveDeckCardsParams) {
    return api
      .prepareRequest(CARD_ENDPOINTS.MOVE(params.deckId), HTTP_METHODS.POST)
      .setHeaders(getAuthHeaders())
      .setBody({ cardIds: params.cardIds })
      .execRequest<DeckCardMembershipMutationResult>();
  },

  update(params: UpdateCardPayload) {
    const { id, ...data } = params;

    return api
      .prepareRequest(CARD_ENDPOINTS.DETAIL(id), HTTP_METHODS.PUT)
      .setHeaders(getAuthHeaders())
      .setBody(data)
      .execRequest<CardRecord>();
  },

  delete(params: CardIdPayload) {
    return api
      .prepareRequest(CARD_ENDPOINTS.DETAIL(params.id), HTTP_METHODS.DELETE)
      .setHeaders(getAuthHeaders())
      .execRequest<void>();
  },

  search(params: SearchRequest) {
    return api
      .prepareRequest(SEARCH_ENDPOINTS.BASE, HTTP_METHODS.GET)
      .setHeaders(getAuthHeaders())
      .setQueryParams({
        q: params.q,
        type: 'card',
        limit: params.limit,
      })
      .execRequest<SearchResultItem[]>();
  },
};

import { getAuthHeaders } from '@features/auth/session';

import { HTTP_METHODS, ManageService } from '@shared/services';

import type { SupportedCardKind } from '../card-kinds';
import type {
  CardRecord,
  UploadCardAssetParams,
  UploadedCardAsset,
  DeckCardMembershipMutationResult,
  DeckMoveCandidatesParams,
  ImportCardsResponse,
  ImportCsvParams,
  MoveDeckCardsParams,
} from '../types';
import type { SearchRequest, SearchResultItem } from '../../search/types';

interface CardPayload {
  deckId?: string;
  deckIds?: string[];
  kind: SupportedCardKind;
  fields: Record<string, unknown>;
}

interface UpdateCardPayload {
  id: string;
  deckIds?: string[];
  kind?: SupportedCardKind;
  fields?: Record<string, unknown>;
}

interface CardIdPayload {
  id: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || '';
const api = ManageService(API_URL);

const CARD_ENDPOINTS = {
  BASE: '/v1/cards',
  ASSETS: '/v1/cards/assets',
  IMPORT: '/v1/cards/import',
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

  importFromCsv(params: ImportCsvParams) {
    const formData = new FormData();
    formData.append('file', params.file);
    if (params.deckId) {
      formData.append('deckId', params.deckId);
    }

    return api
      .prepareRequest(CARD_ENDPOINTS.IMPORT, HTTP_METHODS.POST)
      .setHeaders(getAuthHeaders())
      .setFormBody(formData)
      .execRequest<ImportCardsResponse>();
  },

  uploadAsset(params: UploadCardAssetParams) {
    const formData = new FormData();
    formData.append('file', params.file);
    formData.append('assetType', params.assetType);

    return api
      .prepareRequest(CARD_ENDPOINTS.ASSETS, HTTP_METHODS.POST)
      .setHeaders(getAuthHeaders())
      .setFormBody(formData)
      .execRequest<UploadedCardAsset>();
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

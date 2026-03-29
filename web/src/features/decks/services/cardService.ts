import { ManageService, HTTP_METHODS, getAuthHeaders } from '@shared/services';

type CardPayload = {
  deckId: string;
  kind: string;
  fields: Record<string, unknown>;
};

type UpdateCardPayload = {
  id: string;
  kind?: string;
  fields?: Record<string, unknown>;
};

type CardIdPayload = {
  id: string;
};

export type CardRecord = {
  id: string;
  deckId: string;
  kind: string;
  fields: Record<string, unknown>;
  createdAt: string;
};

export const CARD_KIND_OPTIONS = ['basic', 'cloze', 'mcq'] as const;

const API_URL = process.env.NEXT_PUBLIC_API_URL || '';
const api = ManageService(API_URL);

const CARD_ENDPOINTS = {
  BASE: '/v1/cards',
  DETAIL: (id: string) => `/v1/cards/${id}`,
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
};

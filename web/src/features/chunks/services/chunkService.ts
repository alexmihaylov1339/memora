import { ManageService, HTTP_METHODS, getAuthHeaders } from '@shared/services';
import type {
  ChunkIdParams,
  ChunkRecord,
  CreateChunkDto,
  DeckChunkListParams,
  UpdateChunkDto,
} from '../types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || '';
const api = ManageService(API_URL);

const CHUNK_ENDPOINTS = {
  BASE: '/v1/chunks',
  DETAIL: (id: string) => `/v1/chunks/${id}`,
  LIST_BY_DECK: (deckId: string) => `/v1/decks/${deckId}/chunks`,
} as const;

export const chunkService = {
  create(params: CreateChunkDto) {
    return api
      .prepareRequest(CHUNK_ENDPOINTS.BASE, HTTP_METHODS.POST)
      .setHeaders(getAuthHeaders())
      .setBody(params)
      .execRequest<ChunkRecord>();
  },

  getById(params: ChunkIdParams) {
    return api
      .prepareRequest(CHUNK_ENDPOINTS.DETAIL(params.id), HTTP_METHODS.GET)
      .setHeaders(getAuthHeaders())
      .execRequest<ChunkRecord>();
  },

  update(params: ChunkIdParams & UpdateChunkDto) {
    const { id, ...data } = params;

    return api
      .prepareRequest(CHUNK_ENDPOINTS.DETAIL(id), HTTP_METHODS.PUT)
      .setHeaders(getAuthHeaders())
      .setBody(data)
      .execRequest<ChunkRecord>();
  },

  delete(params: ChunkIdParams) {
    return api
      .prepareRequest(CHUNK_ENDPOINTS.DETAIL(params.id), HTTP_METHODS.DELETE)
      .setHeaders(getAuthHeaders())
      .execRequest<void>();
  },

  listByDeck(params: DeckChunkListParams) {
    const { deckId, limit, offset, direction } = params;
    const queryParams: Record<string, string | number | boolean> = {};

    if (limit !== undefined) {
      queryParams.limit = limit;
    }
    if (offset !== undefined) {
      queryParams.offset = offset;
    }
    if (direction !== undefined) {
      queryParams.direction = direction;
    }

    return api
      .prepareRequest(CHUNK_ENDPOINTS.LIST_BY_DECK(deckId), HTTP_METHODS.GET)
      .setHeaders(getAuthHeaders())
      .setQueryParams(queryParams)
      .execRequest<ChunkRecord[]>();
  },
};

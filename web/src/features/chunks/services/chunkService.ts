import { ManageService, HTTP_METHODS, getAuthHeaders } from '@shared/services';
import { setQueryParamIfDefined } from '@shared/utils';
import type {
  ChunkIdParams,
  ChunkRecord,
  CreateChunkDto,
  DeckChunkListParams,
  UpdateChunkDto,
} from '../types';
import type { SearchRequest, SearchResultItem } from '../../search/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || '';
const api = ManageService(API_URL);

const CHUNK_ENDPOINTS = {
  BASE: '/v1/chunks',
  DETAIL: (id: string) => `/v1/chunks/${id}`,
  LIST_BY_DECK: (deckId: string) => `/v1/decks/${deckId}/chunks`,
} as const;
const SEARCH_ENDPOINTS = {
  BASE: '/v1/search',
} as const;

export const chunkService = {
  listAll() {
    return api
      .prepareRequest(CHUNK_ENDPOINTS.BASE, HTTP_METHODS.GET)
      .setHeaders(getAuthHeaders())
      .execRequest<ChunkRecord[]>();
  },

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

    setQueryParamIfDefined(queryParams, 'limit', limit);
    setQueryParamIfDefined(queryParams, 'offset', offset);
    setQueryParamIfDefined(queryParams, 'direction', direction);

    return api
      .prepareRequest(CHUNK_ENDPOINTS.LIST_BY_DECK(deckId), HTTP_METHODS.GET)
      .setHeaders(getAuthHeaders())
      .setQueryParams(queryParams)
      .execRequest<ChunkRecord[]>();
  },

  search(params: SearchRequest) {
    return api
      .prepareRequest(SEARCH_ENDPOINTS.BASE, HTTP_METHODS.GET)
      .setHeaders(getAuthHeaders())
      .setQueryParams({
        q: params.q,
        type: 'chunk',
        limit: params.limit,
      })
      .execRequest<SearchResultItem[]>();
  },
};

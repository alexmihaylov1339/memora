import { ManageService, HTTP_METHODS, getAuthHeaders } from '@shared/services';
import type {
  ChunkIdParams,
  ChunkRecord,
  CreateChunkDto,
  UpdateChunkDto,
} from '../types';
import type { SearchRequest, SearchResultItem } from '../../search/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || '';
const api = ManageService(API_URL);

const CHUNK_ENDPOINTS = {
  BASE: '/v1/chunks',
  DETAIL: (id: string) => `/v1/chunks/${id}`,
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

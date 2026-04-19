import { ManageService, HTTP_METHODS, getAuthHeaders } from '@shared/services';
import type {
  DeckChunkMembershipMutationResult,
  DeckMoveChunkCandidatesParams,
  ChunkIdParams,
  ChunkRecord,
  CreateChunkDto,
  MoveDeckChunksParams,
  UpdateChunkDto,
} from '../types';
import type { SearchRequest, SearchResultItem } from '../../search/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || '';
const api = ManageService(API_URL);

const CHUNK_ENDPOINTS = {
  BASE: '/v1/chunks',
  DETAIL: (id: string) => `/v1/chunks/${id}`,
  MOVE_CANDIDATES: (deckId: string) => `/v1/decks/${deckId}/move-candidates/chunks`,
  MOVE: (deckId: string) => `/v1/decks/${deckId}/move/chunks`,
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

  getMoveCandidates(params: DeckMoveChunkCandidatesParams) {
    return api
      .prepareRequest(CHUNK_ENDPOINTS.MOVE_CANDIDATES(params.deckId), HTTP_METHODS.GET)
      .setHeaders(getAuthHeaders())
      .execRequest<ChunkRecord[]>();
  },

  moveToDeck(params: MoveDeckChunksParams) {
    return api
      .prepareRequest(CHUNK_ENDPOINTS.MOVE(params.deckId), HTTP_METHODS.POST)
      .setHeaders(getAuthHeaders())
      .setBody({ chunkIds: params.chunkIds })
      .execRequest<DeckChunkMembershipMutationResult>();
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

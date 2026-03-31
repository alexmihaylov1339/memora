import { ManageService, HTTP_METHODS, getAuthHeaders } from '@shared/services';
import type {
  CreateDeckDto,
  CreateDeckResponse,
  Deck,
  DeckIdParams,
  GetDeckByIdResponse,
  UpdateDeckDto,
  UpdateDeckResponse,
} from '../types';

import { DECK_ENDPOINTS } from '../constants';

const API_URL = process.env.NEXT_PUBLIC_API_URL || '';
const api = ManageService(API_URL);

/**
 * Deck service with all CRUD operations
 * Built with ManageService for centralized request handling
 */
export const deckService = {
  /**
   * Fetch all decks
   * @example
   * ```typescript
   * const decks = useServiceQuery(DECKS_QUERY_KEYS.all, deckService.getAll);
   * ```
   */
  getAll() {
    return api
      .prepareRequest(DECK_ENDPOINTS.BASE, HTTP_METHODS.GET)
      .setHeaders(getAuthHeaders())
      .execRequest<Deck[]>();
  },

  /**
   * Fetch a single deck by ID
   * @example
   * ```typescript
   * const deck = useServiceQuery(DECKS_QUERY_KEYS.detail(id), deckService.getById, { id });
   * ```
   */
  getById(params: DeckIdParams) {
    return api
      .prepareRequest(DECK_ENDPOINTS.DETAIL(params.id), HTTP_METHODS.GET)
      .setHeaders(getAuthHeaders())
      .execRequest<GetDeckByIdResponse>();
  },

  /**
   * Create a new deck
   * @example
   * ```typescript
   * const createDeck = useService(deckService.create, {
   *   onSuccess: () => queryClient.invalidateQueries({ queryKey: DECKS_QUERY_KEYS.all })
   * });
   * await createDeck.fetch({ name: 'My Deck', description: 'Description' });
   * ```
   */
  create(params: CreateDeckDto) {
    return api
      .prepareRequest(DECK_ENDPOINTS.BASE, HTTP_METHODS.POST)
      .setHeaders(getAuthHeaders())
      .setBody(params)
      .execRequest<CreateDeckResponse>();
  },

  /**
   * Update an existing deck
   * @example
   * ```typescript
   * const updateDeck = useService(deckService.update);
   * await updateDeck.fetch({ id: '123', name: 'Updated Name' });
   * ```
   */
  update(params: DeckIdParams & UpdateDeckDto) {
    const { id, ...data } = params;
    return api
      .prepareRequest(DECK_ENDPOINTS.DETAIL(id), HTTP_METHODS.PUT)
      .setHeaders(getAuthHeaders())
      .setBody(data)
      .execRequest<UpdateDeckResponse>();
  },

  /**
   * Delete a deck
   * @example
   * ```typescript
   * const deleteDeck = useService(deckService.delete);
   * await deleteDeck.fetch({ id: '123' });
   * ```
   */
  delete(params: DeckIdParams) {
    return api
      .prepareRequest(DECK_ENDPOINTS.DETAIL(params.id), HTTP_METHODS.DELETE)
      .setHeaders(getAuthHeaders())
      .execRequest<void>();
  },
};

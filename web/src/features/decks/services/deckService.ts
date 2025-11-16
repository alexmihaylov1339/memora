import { ManageService, HTTP_METHODS } from '@shared/services';
import type { CreateDeckDto, Deck } from '../types';

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
  async getAll(): Promise<Deck[]> {
    return api
      .prepareRequest(DECK_ENDPOINTS.BASE, HTTP_METHODS.GET)
      .execRequest<Deck[]>();
  },

  /**
   * Fetch a single deck by ID
   * @example
   * ```typescript
   * const deck = useServiceQuery(DECKS_QUERY_KEYS.detail(id), deckService.getById, { id });
   * ```
   */
  async getById(params: { id: string }): Promise<Deck> {
    return api
      .prepareRequest(DECK_ENDPOINTS.DETAIL(params.id), HTTP_METHODS.GET)
      .execRequest<Deck>();
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
  async create(params: CreateDeckDto): Promise<Deck> {
    return api
      .prepareRequest(DECK_ENDPOINTS.BASE, HTTP_METHODS.POST)
      .setBody(params)
      .execRequest<Deck>();
  },

  /**
   * Update an existing deck
   * @example
   * ```typescript
   * const updateDeck = useService(deckService.update);
   * await updateDeck.fetch({ id: '123', name: 'Updated Name' });
   * ```
   */
  async update(params: { id: string; name?: string; description?: string }): Promise<Deck> {
    const { id, ...data } = params;
    return api
      .prepareRequest(DECK_ENDPOINTS.DETAIL(id), HTTP_METHODS.PUT)
      .setBody(data)
      .execRequest<Deck>();
  },

  /**
   * Delete a deck
   * @example
   * ```typescript
   * const deleteDeck = useService(deckService.delete);
   * await deleteDeck.fetch({ id: '123' });
   * ```
   */
  async delete(params: { id: string }): Promise<void> {
    return api
      .prepareRequest(DECK_ENDPOINTS.DETAIL(params.id), HTTP_METHODS.DELETE)
      .execRequest<void>();
  },
};


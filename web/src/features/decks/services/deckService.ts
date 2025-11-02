import type { CreateDeckDto, Deck } from '../types';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

/**
 * Deck service with all CRUD operations
 * Use with useServiceQuery for reads and useService for mutations
 */
export const deckService = {
  /**
   * Fetch all decks
   * @example
   * ```typescript
   * const decks = useServiceQuery(['decks'], deckService.getAll, undefined);
   * ```
   */
  async getAll(): Promise<Deck[]> {
    const res = await fetch(`${API_URL}/v1/decks`, {
      cache: 'no-store',
    });

    if (!res.ok) {
      throw new Error('Failed to fetch decks');
    }

    return res.json();
  },

  /**
   * Fetch a single deck by ID
   * @example
   * ```typescript
   * const deck = useServiceQuery(['deck', id], deckService.getById, { id });
   * ```
   */
  async getById(params: { id: string }): Promise<Deck> {
    const res = await fetch(`${API_URL}/v1/decks/${params.id}`, {
      cache: 'no-store',
    });

    if (!res.ok) {
      throw new Error('Failed to fetch deck');
    }

    return res.json();
  },

  /**
   * Create a new deck
   * @example
   * ```typescript
   * const createDeck = useService(deckService.create, {
   *   onSuccess: () => queryClient.invalidateQueries({ queryKey: ['decks'] })
   * });
   * await createDeck.fetch({ name: 'My Deck', description: 'Description' });
   * ```
   */
  async create(params: CreateDeckDto): Promise<Deck> {
    const res = await fetch(`${API_URL}/v1/decks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });

    if (!res.ok) {
      throw new Error('Failed to create deck');
    }

    return res.json();
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
    const res = await fetch(`${API_URL}/v1/decks/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      throw new Error('Failed to update deck');
    }

    return res.json();
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
    const res = await fetch(`${API_URL}/v1/decks/${params.id}`, {
      method: 'DELETE',
    });

    if (!res.ok) {
      throw new Error('Failed to delete deck');
    }
  },
};


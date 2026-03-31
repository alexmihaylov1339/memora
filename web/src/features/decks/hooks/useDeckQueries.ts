import { useServiceQuery, type UseServiceQueryOptions } from '@shared/hooks';
import { DECKS_QUERY_KEYS } from '../constants';
import { deckService } from '../services';
import type { Deck, GetDeckByIdResponse } from '../types';

export function useDecksListQuery(options?: UseServiceQueryOptions<Deck[]>) {
  return useServiceQuery(DECKS_QUERY_KEYS.all, deckService.getAll, options);
}

export function useDeckDetailQuery(
  id: string,
  options?: UseServiceQueryOptions<GetDeckByIdResponse>
) {
  return useServiceQuery(
    DECKS_QUERY_KEYS.detail(id),
    deckService.getById,
    { id },
    {
      enabled: Boolean(id),
      ...options,
    }
  );
}

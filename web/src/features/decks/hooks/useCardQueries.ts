import { useServiceQuery, type UseServiceQueryOptions } from '@shared/hooks';
import { cardService } from '../services';
import type { CardRecord, DeckCardsParams } from '../types';

const CARD_QUERY_KEYS = {
  detail: (id: string) => ['cards', 'detail', id],
  listByDeck: (deckId: string) => ['cards', 'deck', deckId],
};

export function useCardDetailQuery(
  id: string,
  options?: UseServiceQueryOptions<CardRecord>
) {
  return useServiceQuery(
    CARD_QUERY_KEYS.detail(id),
    cardService.getById,
    { id },
    {
      enabled: Boolean(id),
      ...options,
    }
  );
}

export function useDeckCardsQuery(
  deckId: string,
  options?: UseServiceQueryOptions<CardRecord[]>,
) {
  return useServiceQuery<DeckCardsParams, CardRecord[]>(
    CARD_QUERY_KEYS.listByDeck(deckId),
    cardService.listByDeck,
    { deckId },
    {
      enabled: Boolean(deckId),
      ...options,
    },
  );
}

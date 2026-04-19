import { useServiceQuery, type UseServiceQueryOptions } from '@shared/hooks';
import { cardService } from '../services';
import type { CardRecord } from '../types';

export const CARD_QUERY_KEYS = {
  all: ['cards'],
  moveCandidates: (deckId: string) => ['cards', 'move-candidates', deckId],
  detail: (id: string) => ['cards', 'detail', id],
};

export function useCardsListQuery(
  options?: UseServiceQueryOptions<CardRecord[]>,
) {
  return useServiceQuery(CARD_QUERY_KEYS.all, cardService.getAll, options);
}

export function useDeckMovableCardsQuery(
  deckId: string,
  options?: UseServiceQueryOptions<CardRecord[]>,
) {
  return useServiceQuery(
    CARD_QUERY_KEYS.moveCandidates(deckId),
    cardService.getMoveCandidates,
    { deckId },
    {
      enabled: Boolean(deckId),
      ...options,
    },
  );
}

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

import { useServiceQuery, type UseServiceQueryOptions } from '@shared/hooks';
import { cardService } from '../services';
import type { CardRecord } from '../types';

const CARD_QUERY_KEYS = {
  all: ['cards'],
  detail: (id: string) => ['cards', 'detail', id],
};

export function useCardsListQuery(
  options?: UseServiceQueryOptions<CardRecord[]>,
) {
  return useServiceQuery(CARD_QUERY_KEYS.all, cardService.getAll, options);
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

import { useServiceQuery, type UseServiceQueryOptions } from '@shared/hooks';
import { cardService } from '../services';
import type { CardRecord } from '../services/cardService';

const CARD_QUERY_KEYS = {
  detail: (id: string) => ['cards', 'detail', id],
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

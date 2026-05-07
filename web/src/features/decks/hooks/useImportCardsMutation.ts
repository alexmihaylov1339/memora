import { useQueryClient } from '@tanstack/react-query';

import { useService, type UseServiceOptions } from '@shared/hooks';

import { cardService } from '../services';
import type { ImportCardsResponse, ImportCsvParams } from '../types';
import { DECKS_QUERY_KEYS } from '../constants';
import { CARD_QUERY_KEYS } from './useCardQueries';

export function useImportCardsMutation(
  options?: UseServiceOptions<ImportCardsResponse>,
) {
  const queryClient = useQueryClient();

  return useService<ImportCsvParams, ImportCardsResponse>(
    cardService.importFromCsv,
    {
      ...options,
      onSuccess: (data) => {
        queryClient.invalidateQueries({ queryKey: CARD_QUERY_KEYS.all });
        queryClient.invalidateQueries({ queryKey: DECKS_QUERY_KEYS.all });
        options?.onSuccess?.(data);
      },
    },
  );
}

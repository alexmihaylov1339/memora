import { useQueryClient } from '@tanstack/react-query';
import { useService, type UseServiceOptions } from '@shared/hooks';
import { DECKS_QUERY_KEYS } from '../constants';
import { cardService } from '../services';
import type {
  CardRecord,
  DeckCardMembershipMutationResult,
  MoveDeckCardsParams,
} from '../types';
import { CARD_QUERY_KEYS } from './useCardQueries';

interface CreateCardParams {
  deckId: string;
  kind: string;
  fields: Record<string, unknown>;
}

interface UpdateCardParams {
  id: string;
  kind?: string;
  fields?: Record<string, unknown>;
}

interface CardIdParams {
  id: string;
}

export function useCreateCardMutation(options?: UseServiceOptions<CardRecord>) {
  const queryClient = useQueryClient();

  return useService<CreateCardParams, CardRecord>(cardService.create, {
    ...options,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: CARD_QUERY_KEYS.all });
      queryClient.invalidateQueries({ queryKey: DECKS_QUERY_KEYS.all });
      options?.onSuccess?.(data);
    },
  });
}

export function useUpdateCardMutation(options?: UseServiceOptions<CardRecord>) {
  const queryClient = useQueryClient();

  return useService<UpdateCardParams, CardRecord>(cardService.update, {
    ...options,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: CARD_QUERY_KEYS.all });
      queryClient.invalidateQueries({ queryKey: DECKS_QUERY_KEYS.all });
      options?.onSuccess?.(data);
    },
  });
}

export function useDeleteCardMutation(options?: UseServiceOptions<void>) {
  const queryClient = useQueryClient();

  return useService<CardIdParams, void>(cardService.delete, {
    ...options,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: CARD_QUERY_KEYS.all });
      queryClient.invalidateQueries({ queryKey: DECKS_QUERY_KEYS.all });
      options?.onSuccess?.(data);
    },
  });
}

export function useMoveDeckCardsMutation(
  options?: UseServiceOptions<DeckCardMembershipMutationResult>,
) {
  const queryClient = useQueryClient();

  return useService<MoveDeckCardsParams, DeckCardMembershipMutationResult>(
    cardService.moveToDeck,
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

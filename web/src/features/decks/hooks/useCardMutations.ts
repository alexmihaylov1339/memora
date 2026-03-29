import { useService, type UseServiceOptions } from '@shared/hooks';
import { cardService } from '../services';
import type { CardRecord } from '../services/cardService';

type CreateCardParams = {
  deckId: string;
  kind: string;
  fields: Record<string, unknown>;
};

type UpdateCardParams = {
  id: string;
  kind?: string;
  fields?: Record<string, unknown>;
};

type CardIdParams = {
  id: string;
};

export function useCreateCardMutation(options?: UseServiceOptions<CardRecord>) {
  return useService<CreateCardParams, CardRecord>(cardService.create, options);
}

export function useUpdateCardMutation(options?: UseServiceOptions<CardRecord>) {
  return useService<UpdateCardParams, CardRecord>(cardService.update, options);
}

export function useDeleteCardMutation(options?: UseServiceOptions<void>) {
  return useService<CardIdParams, void>(cardService.delete, options);
}

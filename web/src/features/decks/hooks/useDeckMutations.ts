import { useService, type UseServiceOptions } from '@shared/hooks';
import { deckService } from '../services';
import type {
  CreateDeckDto,
  CreateDeckResponse,
  DeckIdParams,
  UpdateDeckDto,
  UpdateDeckResponse,
} from '../types';

export function useCreateDeckMutation(
  options?: UseServiceOptions<CreateDeckResponse>
) {
  return useService<CreateDeckDto, CreateDeckResponse>(deckService.create, options);
}

export function useUpdateDeckMutation(
  options?: UseServiceOptions<UpdateDeckResponse>
) {
  return useService<DeckIdParams & UpdateDeckDto, UpdateDeckResponse>(
    deckService.update,
    options
  );
}

export function useDeleteDeckMutation(options?: UseServiceOptions<void>) {
  return useService<DeckIdParams, void>(deckService.delete, options);
}

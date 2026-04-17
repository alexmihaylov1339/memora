import { useService, type UseServiceOptions } from '@shared/hooks';
import { deckService } from '../services';
import type {
  CreateDeckShareDto,
  CreateDeckShareResponse,
  DeckShareParams,
  RemoveDeckShareParams,
} from '../types';

export function useCreateDeckShareMutation(
  options?: UseServiceOptions<CreateDeckShareResponse>,
) {
  return useService<DeckShareParams & CreateDeckShareDto, CreateDeckShareResponse>(
    deckService.share,
    options,
  );
}

export function useRemoveDeckShareMutation(
  options?: UseServiceOptions<void>,
) {
  return useService<RemoveDeckShareParams, void>(deckService.removeShare, options);
}

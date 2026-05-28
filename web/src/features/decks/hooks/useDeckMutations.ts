import { useService, type UseServiceOptions } from '@shared/hooks';
import { deckService } from '../services';
import type {
  CopyPublicDeckResponse,
  CreateDeckDto,
  CreateDeckResponse,
  DeckIdParams,
  UpdateDeckPublicationDto,
  UpdateDeckPublicationResponse,
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

export function useUpdateDeckPublicationMutation(
  options?: UseServiceOptions<UpdateDeckPublicationResponse>,
) {
  return useService<DeckIdParams & UpdateDeckPublicationDto, UpdateDeckPublicationResponse>(
    deckService.updatePublication,
    options,
  );
}

export function useCopyPublicDeckMutation(
  options?: UseServiceOptions<CopyPublicDeckResponse>,
) {
  return useService<DeckIdParams, CopyPublicDeckResponse>(
    deckService.copyPublicDeck,
    options,
  );
}

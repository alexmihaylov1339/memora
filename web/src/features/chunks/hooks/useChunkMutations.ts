import { useQueryClient } from '@tanstack/react-query';
import { useService, type UseServiceOptions } from '@shared/hooks';
import { DECKS_QUERY_KEYS } from '@features/decks/constants';
import { chunkService } from '../services';
import type {
  DeckChunkMembershipMutationResult,
  MoveDeckChunksParams,
  ChunkIdParams,
  ChunkRecord,
  CreateChunkDto,
  UpdateChunkDto,
} from '../types';
import { CHUNK_QUERY_KEYS } from './useChunkQueries';

export function useCreateChunkMutation(options?: UseServiceOptions<ChunkRecord>) {
  const queryClient = useQueryClient();

  return useService<CreateChunkDto, ChunkRecord>(chunkService.create, {
    ...options,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: CHUNK_QUERY_KEYS.all });
      queryClient.invalidateQueries({ queryKey: DECKS_QUERY_KEYS.all });
      options?.onSuccess?.(data);
    },
  });
}

export function useUpdateChunkMutation(
  options?: UseServiceOptions<ChunkRecord>,
) {
  const queryClient = useQueryClient();

  return useService<ChunkIdParams & UpdateChunkDto, ChunkRecord>(
    chunkService.update,
    {
      ...options,
      onSuccess: (data) => {
        queryClient.invalidateQueries({ queryKey: CHUNK_QUERY_KEYS.all });
        queryClient.invalidateQueries({ queryKey: DECKS_QUERY_KEYS.all });
        options?.onSuccess?.(data);
      },
    },
  );
}

export function useDeleteChunkMutation(options?: UseServiceOptions<void>) {
  const queryClient = useQueryClient();

  return useService<ChunkIdParams, void>(chunkService.delete, {
    ...options,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: CHUNK_QUERY_KEYS.all });
      queryClient.invalidateQueries({ queryKey: DECKS_QUERY_KEYS.all });
      options?.onSuccess?.(data);
    },
  });
}

export function useMoveDeckChunksMutation(
  options?: UseServiceOptions<DeckChunkMembershipMutationResult>,
) {
  const queryClient = useQueryClient();

  return useService<MoveDeckChunksParams, DeckChunkMembershipMutationResult>(
    chunkService.moveToDeck,
    {
      ...options,
      onSuccess: (data) => {
        queryClient.invalidateQueries({ queryKey: CHUNK_QUERY_KEYS.all });
        queryClient.invalidateQueries({ queryKey: DECKS_QUERY_KEYS.all });
        options?.onSuccess?.(data);
      },
    },
  );
}

import { useServiceQuery, type UseServiceQueryOptions } from '@shared/hooks';
import { chunkService } from '../services';
import type { ChunkRecord } from '../types';

export const CHUNK_QUERY_KEYS = {
  all: ['chunks'],
  moveCandidates: (deckId: string) => ['chunks', 'move-candidates', deckId],
  detail: (id: string) => ['chunks', 'detail', id],
};

export function useChunksListQuery(
  options?: UseServiceQueryOptions<ChunkRecord[]>,
) {
  return useServiceQuery(CHUNK_QUERY_KEYS.all, chunkService.listAll, options);
}

export function useDeckMovableChunksQuery(
  deckId: string,
  options?: UseServiceQueryOptions<ChunkRecord[]>,
) {
  return useServiceQuery(
    CHUNK_QUERY_KEYS.moveCandidates(deckId),
    chunkService.getMoveCandidates,
    { deckId },
    {
      enabled: Boolean(deckId),
      ...options,
    },
  );
}

export function useChunkDetailQuery(
  id: string,
  options?: UseServiceQueryOptions<ChunkRecord>,
) {
  return useServiceQuery(
    CHUNK_QUERY_KEYS.detail(id),
    chunkService.getById,
    { id },
    {
      enabled: Boolean(id),
      ...options,
    },
  );
}

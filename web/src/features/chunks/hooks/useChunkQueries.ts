import { useServiceQuery, type UseServiceQueryOptions } from '@shared/hooks';
import { chunkService } from '../services';
import type { ChunkRecord, DeckChunkListParams } from '../types';

export const CHUNK_QUERY_KEYS = {
  all: ['chunks'],
  detail: (id: string) => ['chunks', 'detail', id],
  listByDeck: (deckId: string) => ['chunks', 'deck', deckId],
};

export function useChunksListQuery(
  options?: UseServiceQueryOptions<ChunkRecord[]>,
) {
  return useServiceQuery(CHUNK_QUERY_KEYS.all, chunkService.listAll, options);
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

export function useDeckChunksQuery(
  deckId: string,
  options?: UseServiceQueryOptions<ChunkRecord[]>,
) {
  return useServiceQuery<DeckChunkListParams, ChunkRecord[]>(
    CHUNK_QUERY_KEYS.listByDeck(deckId),
    chunkService.listByDeck,
    { deckId },
    {
      enabled: Boolean(deckId),
      ...options,
    },
  );
}

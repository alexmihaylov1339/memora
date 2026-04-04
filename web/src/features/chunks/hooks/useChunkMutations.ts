import { useService, type UseServiceOptions } from '@shared/hooks';
import { chunkService } from '../services';
import type {
  ChunkIdParams,
  ChunkRecord,
  CreateChunkDto,
  UpdateChunkDto,
} from '../types';

export function useCreateChunkMutation(options?: UseServiceOptions<ChunkRecord>) {
  return useService<CreateChunkDto, ChunkRecord>(chunkService.create, options);
}

export function useUpdateChunkMutation(
  options?: UseServiceOptions<ChunkRecord>,
) {
  return useService<ChunkIdParams & UpdateChunkDto, ChunkRecord>(
    chunkService.update,
    options,
  );
}

export function useDeleteChunkMutation(options?: UseServiceOptions<void>) {
  return useService<ChunkIdParams, void>(chunkService.delete, options);
}

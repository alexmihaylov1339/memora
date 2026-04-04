import type { ChunkSummary } from '../chunks.service';

export interface ChunkResponseDto {
  id: string;
  deckId: string;
  title: string;
  cardIds: string[];
  position: number;
  createdAt: string;
  updatedAt: string;
}

export function serializeChunkResponse(chunk: ChunkSummary): ChunkResponseDto {
  return {
    id: chunk.id,
    deckId: chunk.deckId,
    title: chunk.title,
    cardIds: chunk.cardIds,
    position: chunk.position,
    createdAt: chunk.createdAt.toISOString(),
    updatedAt: chunk.updatedAt.toISOString(),
  };
}

export function serializeChunkResponseList(
  chunks: ChunkSummary[],
): ChunkResponseDto[] {
  return chunks.map(serializeChunkResponse);
}

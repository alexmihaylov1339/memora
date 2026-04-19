export interface ChunkRecord {
  id: string;
  deckId: string;
  title: string;
  cardIds: string[];
  position: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateChunkDto {
  deckId: string;
  title: string;
  cardIds: string[];
  position?: number;
}

export interface UpdateChunkDto {
  title?: string;
  cardIds?: string[];
  position?: number;
}

export interface ChunkIdParams {
  id: string;
}

export interface DeckMoveChunkCandidatesParams {
  deckId: string;
}

export interface MoveDeckChunksDto {
  chunkIds: string[];
}

export interface MoveDeckChunksParams
  extends DeckMoveChunkCandidatesParams,
    MoveDeckChunksDto {}

export interface DeckChunkMembershipMutationResult {
  deckId: string;
  chunkIds: string[];
  count: number;
}

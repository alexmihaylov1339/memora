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

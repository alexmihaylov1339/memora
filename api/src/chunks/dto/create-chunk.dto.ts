export interface CreateChunkDto {
  deckId: string;
  title: string;
  cardIds?: string[];
  position?: number;
}

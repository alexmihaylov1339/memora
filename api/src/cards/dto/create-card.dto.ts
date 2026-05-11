export interface CreateCardDto {
  deckId?: string;
  deckIds?: string[];
  kind: string;
  fields: unknown;
}

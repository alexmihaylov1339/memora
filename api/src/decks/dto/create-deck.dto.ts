export interface CreateDeckDto {
  name: string;
  description?: string;
  cardIds?: string[];
}

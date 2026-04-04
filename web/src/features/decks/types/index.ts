export interface CreateDeckDto {
  name: string;
  description?: string;
}

export interface DeckListItem {
  id: string;
  name: string;
  count: number;
}

export interface DeckRecord {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DeckDetail extends DeckRecord {
  count: number;
}

export interface UpdateDeckDto {
  name?: string;
  description?: string;
}

export interface DeckIdParams {
  id: string;
}

export interface CardRecord {
  id: string;
  deckId: string;
  kind: string;
  fields: Record<string, unknown>;
  createdAt: string;
}

export interface DeckCardsParams {
  deckId: string;
}

export type CreateDeckResponse = DeckRecord;
export type UpdateDeckResponse = DeckDetail;
export type GetDeckByIdResponse = DeckDetail;

// Backward-compatible alias for the current decks page usage.
export type Deck = DeckListItem;

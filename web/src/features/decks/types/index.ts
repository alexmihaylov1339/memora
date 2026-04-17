export interface CreateDeckDto {
  name: string;
  description?: string;
  cardIds?: string[];
  chunkIds?: string[];
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
  sharedUsers: DeckShareRecord[];
}

export type DeckSharePermission = 'view' | 'edit';

export interface DeckShareRecord {
  id: string;
  deckId: string;
  userId: string;
  email: string;
  name?: string;
  permission: DeckSharePermission;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateDeckDto {
  name?: string;
  description?: string;
  cardIds?: string[];
  chunkIds?: string[];
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

export interface DeckShareParams {
  deckId: string;
}

export interface CreateDeckShareDto {
  identifier: string;
  permission?: DeckSharePermission;
}

export interface DeckShareInput extends DeckShareParams, CreateDeckShareDto {}

export interface RemoveDeckShareParams extends DeckShareParams {
  sharedUserId: string;
}

export type CreateDeckResponse = DeckRecord;
export type UpdateDeckResponse = DeckDetail;
export type GetDeckByIdResponse = DeckDetail;
export type CreateDeckShareResponse = DeckShareRecord;
export type ListDeckSharesResponse = DeckShareRecord[];
export type RemoveDeckShareResponse = void;

// Backward-compatible alias for the current decks page usage.
export type Deck = DeckListItem;

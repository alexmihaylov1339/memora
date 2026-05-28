import type { SupportedCardKind } from '../card-kinds';
import type { DeckPresentationMode } from '../constants';

export interface CreateDeckDto {
  name: string;
  description?: string;
  cardIds?: string[];
  chunkIds?: string[];
  presentationMode?: DeckPresentationMode;
  reviewIntervalHours?: number[];
}

export interface DeckListItem {
  id: string;
  name: string;
  count: number;
  dueCount: number;
  presentationMode: DeckPresentationMode;
  isPublic: boolean;
}

export interface DeckRecord {
  id: string;
  name: string;
  description?: string;
  presentationMode: DeckPresentationMode;
  isPublic: boolean;
  reviewIntervalHours: number[];
  createdAt: string;
  updatedAt: string;
}

export interface DeckDetail extends DeckRecord {
  count: number;
  sharedUsers: DeckShareRecord[];
}

export interface PublicDeckRecord {
  id: string;
  name: string;
  description?: string;
  count: number;
  presentationMode: DeckPresentationMode;
  ownerDisplayName: string;
  ownerUserId: string | null;
  createdAt: string;
  updatedAt: string;
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
  presentationMode?: DeckPresentationMode;
  reviewIntervalHours?: number[];
}

export interface UpdateDeckPublicationDto {
  isPublic: boolean;
}

export interface DeckIdParams {
  id: string;
}

export interface CardRecord {
  id: string;
  deckId: string | null;
  deckIds?: string[];
  kind: SupportedCardKind | string;
  fields: Record<string, unknown>;
  createdAt: string;
}

export interface DeckMoveCandidatesParams {
  deckId: string;
}

export interface MoveDeckCardsDto {
  cardIds: string[];
}

export interface MoveDeckCardsParams extends DeckMoveCandidatesParams, MoveDeckCardsDto {}

export interface DeckCardMembershipMutationResult {
  deckId: string;
  cardIds: string[];
  count: number;
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
export type ListPublicDecksResponse = PublicDeckRecord[];
export type CreateDeckShareResponse = DeckShareRecord;
export type ListDeckSharesResponse = DeckShareRecord[];
export type RemoveDeckShareResponse = void;
export type UpdateDeckPublicationResponse = DeckDetail;
export type CopyPublicDeckResponse = DeckRecord;

// Backward-compatible alias for the current decks page usage.
export type Deck = DeckListItem;

export interface SkippedRowRecord {
  row: number;
  reason: string;
}

export interface ImportCardsResponse {
  created: number;
  skipped: SkippedRowRecord[];
}

export interface ImportCsvParams {
  file: File;
  deckId?: string;
}

export type CardAssetType = 'image' | 'audio';

export interface UploadedCardAsset {
  path: string;
  mimeType: string;
  size: number;
  url: string;
}

export interface UploadCardAssetParams {
  file: File;
  assetType: CardAssetType;
}

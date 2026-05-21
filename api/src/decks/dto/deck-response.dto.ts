import type { DeckDetail, DeckListItem, DeckRecord } from '../decks.service';
import {
  serializeDeckShareListResponse,
  type DeckShareDto,
} from './deck-share.dto';

export interface DeckListItemDto {
  id: string;
  name: string;
  count: number;
  dueCount: number;
  presentationMode: string;
}

export interface DeckDetailDto {
  id: string;
  name: string;
  description?: string;
  presentationMode: string;
  reviewIntervalHours: number[];
  count: number;
  sharedUsers: DeckShareDto[];
  createdAt: string;
  updatedAt: string;
}

export interface DeckRecordDto {
  id: string;
  name: string;
  description?: string;
  presentationMode: string;
  reviewIntervalHours: number[];
  createdAt: string;
  updatedAt: string;
}

export function serializeDeckListItem(deck: DeckListItem): DeckListItemDto {
  return {
    id: deck.id,
    name: deck.name,
    count: deck.count,
    dueCount: deck.dueCount,
    presentationMode: deck.presentationMode,
  };
}

export function serializeDeckListResponse(
  decks: DeckListItem[],
): DeckListItemDto[] {
  return decks.map(serializeDeckListItem);
}

export function serializeDeckDetail(deck: DeckDetail): DeckDetailDto {
  return {
    id: deck.id,
    name: deck.name,
    description: deck.description,
    presentationMode: deck.presentationMode,
    reviewIntervalHours: deck.reviewIntervalHours,
    count: deck.count,
    sharedUsers: serializeDeckShareListResponse(deck.sharedUsers),
    createdAt: deck.createdAt.toISOString(),
    updatedAt: deck.updatedAt.toISOString(),
  };
}

export function serializeDeckRecord(deck: DeckRecord): DeckRecordDto {
  return {
    id: deck.id,
    name: deck.name,
    description: deck.description,
    presentationMode: deck.presentationMode,
    reviewIntervalHours: deck.reviewIntervalHours,
    createdAt: deck.createdAt.toISOString(),
    updatedAt: deck.updatedAt.toISOString(),
  };
}

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
  isPublic: boolean;
  isWhatDidYouHearEligible: boolean;
  whatDidYouHearEligibleCardCount: number;
}

export interface DeckDetailDto {
  id: string;
  name: string;
  description?: string;
  presentationMode: string;
  isPublic: boolean;
  reviewIntervalHours: number[];
  exerciseSettings: {
    whatDidYouHear: {
      choiceCount: number;
    };
  };
  isWhatDidYouHearEligible: boolean;
  whatDidYouHearEligibleCardCount: number;
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
  isPublic: boolean;
  reviewIntervalHours: number[];
  exerciseSettings: {
    whatDidYouHear: {
      choiceCount: number;
    };
  };
  isWhatDidYouHearEligible: boolean;
  whatDidYouHearEligibleCardCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface PublicDeckListItemDto {
  id: string;
  name: string;
  description?: string;
  count: number;
  presentationMode: string;
  exerciseSettings: {
    whatDidYouHear: {
      choiceCount: number;
    };
  };
  isWhatDidYouHearEligible: boolean;
  whatDidYouHearEligibleCardCount: number;
  ownerDisplayName: string;
  ownerUserId: string | null;
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
    isPublic: deck.isPublic,
    isWhatDidYouHearEligible: deck.isWhatDidYouHearEligible,
    whatDidYouHearEligibleCardCount: deck.whatDidYouHearEligibleCardCount,
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
    isPublic: deck.isPublic,
    reviewIntervalHours: deck.reviewIntervalHours,
    exerciseSettings: deck.exerciseSettings,
    isWhatDidYouHearEligible: deck.isWhatDidYouHearEligible,
    whatDidYouHearEligibleCardCount: deck.whatDidYouHearEligibleCardCount,
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
    isPublic: deck.isPublic,
    reviewIntervalHours: deck.reviewIntervalHours,
    exerciseSettings: deck.exerciseSettings,
    isWhatDidYouHearEligible: deck.isWhatDidYouHearEligible,
    whatDidYouHearEligibleCardCount: deck.whatDidYouHearEligibleCardCount,
    createdAt: deck.createdAt.toISOString(),
    updatedAt: deck.updatedAt.toISOString(),
  };
}

export function serializePublicDeckListResponse(
  decks: Array<{
    id: string;
    name: string;
    description?: string;
    count: number;
    presentationMode: string;
    exerciseSettings: {
      whatDidYouHear: {
        choiceCount: number;
      };
    };
    isWhatDidYouHearEligible: boolean;
    whatDidYouHearEligibleCardCount: number;
    ownerDisplayName: string;
    ownerUserId: string | null;
    createdAt: Date;
    updatedAt: Date;
  }>,
): PublicDeckListItemDto[] {
  return decks.map((deck) => ({
    id: deck.id,
    name: deck.name,
    description: deck.description,
    count: deck.count,
    presentationMode: deck.presentationMode,
    exerciseSettings: deck.exerciseSettings,
    isWhatDidYouHearEligible: deck.isWhatDidYouHearEligible,
    whatDidYouHearEligibleCardCount: deck.whatDidYouHearEligibleCardCount,
    ownerDisplayName: deck.ownerDisplayName,
    ownerUserId: deck.ownerUserId,
    createdAt: deck.createdAt.toISOString(),
    updatedAt: deck.updatedAt.toISOString(),
  }));
}

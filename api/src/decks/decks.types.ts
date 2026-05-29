import type { DeckPresentationMode } from './deck-presentation-mode';
import type { DeckExerciseSettings } from './deck-exercise-settings';

export interface DeckListItem {
  id: string;
  name: string;
  count: number;
  dueCount: number;
  presentationMode: DeckPresentationMode;
  isPublic: boolean;
  isWhatDidYouHearEligible: boolean;
  whatDidYouHearEligibleCardCount: number;
}

export interface DeckRecord {
  id: string;
  name: string;
  description?: string;
  presentationMode: DeckPresentationMode;
  isPublic: boolean;
  reviewIntervalHours: number[];
  exerciseSettings: DeckExerciseSettings;
  isWhatDidYouHearEligible: boolean;
  whatDidYouHearEligibleCardCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface DeckShareSummary {
  id: string;
  deckId: string;
  userId: string;
  email: string;
  name?: string;
  permission: import('./deck-share.types').DeckSharePermission;
  createdAt: Date;
  updatedAt: Date;
}

export interface DeckDetail extends DeckRecord {
  count: number;
  sharedUsers: DeckShareSummary[];
}

export interface PublicDeckListItem {
  id: string;
  name: string;
  description?: string;
  count: number;
  presentationMode: DeckPresentationMode;
  exerciseSettings: DeckExerciseSettings;
  isWhatDidYouHearEligible: boolean;
  whatDidYouHearEligibleCardCount: number;
  ownerDisplayName: string;
  ownerUserId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export type CreateDeckResult =
  | { status: 'created'; deck: DeckRecord }
  | { status: 'invalid_cards' }
  | { status: 'invalid_chunks' };

export type UpdateDeckResult =
  | { status: 'updated'; deck: DeckDetail }
  | { status: 'not_found' }
  | { status: 'invalid_cards' }
  | { status: 'invalid_chunks' };

export type ShareDeckResult =
  | { status: 'shared'; share: DeckShareSummary }
  | { status: 'not_found' }
  | { status: 'share_target_not_found' }
  | { status: 'share_target_ambiguous' }
  | { status: 'already_shared' }
  | { status: 'cannot_share_with_self' };

export type UpdateDeckPublicationResult =
  | { status: 'updated'; deck: DeckDetail }
  | { status: 'not_found' };

export type CopyPublicDeckResult =
  | { status: 'copied'; deck: DeckRecord }
  | { status: 'not_found' };

export interface DeckCardMembershipMutationResult {
  deckId: string;
  cardIds: string[];
  count: number;
}

export interface DeckChunkMembershipMutationResult {
  deckId: string;
  chunkIds: string[];
  count: number;
}

export type MoveDeckCardsResult =
  | { status: 'moved'; result: DeckCardMembershipMutationResult }
  | { status: 'not_found' }
  | { status: 'invalid_cards' };

export type MoveDeckChunksResult =
  | { status: 'moved'; result: DeckChunkMembershipMutationResult }
  | { status: 'not_found' }
  | { status: 'invalid_chunks' };

export type DetachDeckCardsResult =
  | { status: 'detached'; result: DeckCardMembershipMutationResult }
  | { status: 'not_found' }
  | { status: 'invalid_cards' };

export type DetachDeckChunksResult =
  | { status: 'detached'; result: DeckChunkMembershipMutationResult }
  | { status: 'not_found' }
  | { status: 'invalid_chunks' };

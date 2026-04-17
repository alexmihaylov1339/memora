export interface DeckListItem {
  id: string;
  name: string;
  count: number;
}

export interface DeckRecord {
  id: string;
  name: string;
  description?: string;
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

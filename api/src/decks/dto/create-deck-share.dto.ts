import type { DeckSharePermission } from '../deck-share.types';

export interface CreateDeckShareDto {
  identifier: string;
  permission?: DeckSharePermission;
}

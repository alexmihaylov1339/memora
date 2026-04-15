import type { DeckSharePermission } from '../deck-share.types';
import type { DeckShareSummary } from '../decks.service';

export interface DeckShareDto {
  id: string;
  deckId: string;
  userId: string;
  email: string;
  name?: string;
  permission: DeckSharePermission;
  createdAt: string;
  updatedAt: string;
}

export function serializeDeckShare(share: DeckShareSummary): DeckShareDto {
  return {
    id: share.id,
    deckId: share.deckId,
    userId: share.userId,
    email: share.email,
    name: share.name ?? undefined,
    permission: share.permission,
    createdAt: share.createdAt.toISOString(),
    updatedAt: share.updatedAt.toISOString(),
  };
}

export function serializeDeckShareListResponse(
  shares: DeckShareSummary[],
): DeckShareDto[] {
  return shares.map(serializeDeckShare);
}

import type { Prisma } from '@prisma/client';

export interface DeckMembershipCardRecord {
  id: string;
  ownerId: string | null;
  deckId: string | null;
  deckIds: string[];
  kind: string;
  fields: Prisma.JsonValue;
  createdAt: Date;
}

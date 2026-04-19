import type { Prisma } from '@prisma/client';

export interface DeckMembershipCardRecord {
  id: string;
  deckId: string;
  kind: string;
  fields: Prisma.JsonValue;
  createdAt: Date;
}

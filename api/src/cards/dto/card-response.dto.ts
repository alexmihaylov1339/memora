import type { Prisma } from '@prisma/client';
import type { CardRecord } from '../cards.service';

export interface CardResponseDto {
  id: string;
  deckId: string;
  kind: string;
  fields: Prisma.JsonValue;
  createdAt: string;
}

export function serializeCardResponse(card: CardRecord): CardResponseDto {
  return {
    id: card.id,
    deckId: card.deckId,
    kind: card.kind,
    fields: card.fields,
    createdAt: card.createdAt.toISOString(),
  };
}

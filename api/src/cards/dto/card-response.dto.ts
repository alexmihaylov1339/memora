import type { Prisma } from '@prisma/client';
import type { CardRecord } from '../cards.service';

export interface CardResponseDto {
  id: string;
  deckId: string | null;
  deckIds: string[];
  kind: string;
  fields: Prisma.JsonValue;
  createdAt: string;
}

export function serializeCardResponse(card: CardRecord): CardResponseDto {
  return {
    id: card.id,
    deckId: card.deckId,
    deckIds: card.deckIds,
    kind: card.kind,
    fields: card.fields,
    createdAt: card.createdAt.toISOString(),
  };
}

export function serializeCardResponseList(
  cards: CardRecord[],
): CardResponseDto[] {
  return cards.map(serializeCardResponse);
}

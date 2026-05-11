import type { Prisma } from '@prisma/client';

import type { PrismaService } from '../../prisma/prisma.service';
import { initStandaloneCardReviewState } from '../reviews/standalone-card-review';

type CardMembershipPersistenceClient = Pick<
  PrismaService,
  'deckCard' | 'reviewState'
>;

export interface CardRecord {
  id: string;
  ownerId: string | null;
  deckId: string | null;
  deckIds: string[];
  kind: string;
  fields: Prisma.JsonValue;
  createdAt: Date;
}

export type PersistedCardRecord = Omit<CardRecord, 'deckIds'> & {
  deckCards?: { deckId: string }[];
};

export function buildAccessibleCardWhere(
  userId: string,
  deckIds: string[],
): Prisma.CardWhereInput {
  return {
    OR: [
      { ownerId: userId },
      ...(deckIds.length > 0
        ? [{ deckCards: { some: { deckId: { in: deckIds } } } }]
        : []),
    ],
  };
}

export function buildOwnedCardAccessWhere(
  id: string,
  userId: string,
): Prisma.CardWhereInput {
  return {
    id,
    OR: [
      { ownerId: userId },
      { deckCards: { some: { deck: { ownerId: userId } } } },
    ],
  };
}

export function mapCardRecord(card: PersistedCardRecord): CardRecord {
  const deckIds = card.deckCards?.map((membership) => membership.deckId) ?? [];

  return {
    id: card.id,
    ownerId: card.ownerId,
    deckId: deckIds[0] ?? card.deckId,
    deckIds,
    kind: card.kind,
    fields: card.fields,
    createdAt: card.createdAt,
  };
}

export async function hasOwnedDeckIds(
  prisma: PrismaService,
  deckIds: string[],
  userId: string,
): Promise<boolean> {
  if (deckIds.length === 0) {
    return true;
  }

  const decks = await prisma.deck.findMany({
    where: { id: { in: deckIds }, ownerId: userId },
    select: { id: true },
  });

  return decks.length === deckIds.length;
}

export async function createCardDeckMemberships(
  prisma: CardMembershipPersistenceClient,
  cardId: string,
  deckIds: string[],
): Promise<void> {
  if (deckIds.length === 0) {
    return;
  }

  await prisma.deckCard.createMany({
    data: deckIds.map((deckId) => ({ deckId, cardId })),
    skipDuplicates: true,
  });

  await initStandaloneCardReviewState(prisma, [cardId]);
}

export async function replaceOwnedCardDeckMemberships(
  prisma: CardMembershipPersistenceClient,
  cardId: string,
  deckIds: string[],
  userId: string,
): Promise<void> {
  await prisma.deckCard.deleteMany({
    where: { cardId, deck: { ownerId: userId } },
  });

  await createCardDeckMemberships(prisma, cardId, deckIds);
}

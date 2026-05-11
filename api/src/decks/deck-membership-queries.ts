import { PrismaService } from '../../prisma/prisma.service';
import {
  mapChunkSummary,
  type ChunkSummary,
  type PersistedChunkRecord,
} from '../chunks/chunks.helpers';
import { isOwnedDeck } from './deck-membership-access';
import type { DeckMembershipCardRecord } from './deck-membership.types';

export async function listMovableCardsForDeck(
  prisma: PrismaService,
  deckId: string,
  userId: string,
): Promise<DeckMembershipCardRecord[] | null> {
  if (!(await isOwnedDeck(prisma, deckId, userId))) {
    return null;
  }

  const cards = await prisma.card.findMany({
    where: {
      ownerId: userId,
      deckCards: { none: { deckId } },
    },
    orderBy: [{ createdAt: 'desc' }, { id: 'asc' }],
    include: { deckCards: { select: { deckId: true } } },
  });

  return cards.map((card) => ({
    id: card.id,
    ownerId: card.ownerId,
    deckId: card.deckCards[0]?.deckId ?? card.deckId,
    deckIds: card.deckCards.map((membership) => membership.deckId),
    kind: card.kind,
    fields: card.fields,
    createdAt: card.createdAt,
  })) as DeckMembershipCardRecord[];
}

export async function listMovableChunksForDeck(
  prisma: PrismaService,
  deckId: string,
  userId: string,
): Promise<ChunkSummary[] | null> {
  if (!(await isOwnedDeck(prisma, deckId, userId))) {
    return null;
  }

  const chunks = await prisma.chunk.findMany({
    where: {
      ownerId: userId,
      OR: [{ deckId: null }, { deckId: { not: deckId } }],
    },
    orderBy: [{ updatedAt: 'desc' }, { createdAt: 'desc' }],
    include: {
      chunkCards: {
        orderBy: { sequenceIndex: 'asc' },
      },
    },
  });

  return chunks.map((chunk) => mapChunkSummary(chunk as PersistedChunkRecord));
}

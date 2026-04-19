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

  return (await prisma.card.findMany({
    where: { deckId: { not: deckId }, deck: { ownerId: userId } },
    orderBy: [{ createdAt: 'desc' }, { id: 'asc' }],
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
    where: { deckId: { not: deckId }, deck: { ownerId: userId } },
    orderBy: [{ updatedAt: 'desc' }, { createdAt: 'desc' }],
    include: {
      chunkCards: {
        orderBy: { sequenceIndex: 'asc' },
      },
    },
  });

  return chunks.map((chunk) => mapChunkSummary(chunk as PersistedChunkRecord));
}

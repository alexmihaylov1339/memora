import { PrismaService } from '../../prisma/prisma.service';
import { getAccessibleDeckIds } from '../decks/deck-access';
import {
  mapChunkSummary,
  type ChunkSummary,
  type PersistedChunkRecord,
} from './chunks.helpers';

export async function listChunks(
  prisma: PrismaService,
  userId: string,
): Promise<ChunkSummary[]> {
  const deckIds = await getAccessibleDeckIds(prisma, userId);
  if (deckIds.length === 0) {
    return [];
  }

  const chunks = await prisma.chunk.findMany({
    where: { deckId: { in: deckIds } },
    orderBy: [{ updatedAt: 'desc' }, { createdAt: 'desc' }],
    include: {
      chunkCards: {
        orderBy: { sequenceIndex: 'asc' },
      },
    },
  });

  return chunks.map((chunk) => mapChunkSummary(chunk as PersistedChunkRecord));
}

export async function findChunkById(
  prisma: PrismaService,
  id: string,
  userId: string,
): Promise<ChunkSummary | null> {
  const deckIds = await getAccessibleDeckIds(prisma, userId);

  if (deckIds.length === 0) {
    return null;
  }

  const chunk = await prisma.chunk.findFirst({
    where: { id, deckId: { in: deckIds } },
    include: {
      chunkCards: {
        orderBy: { sequenceIndex: 'asc' },
      },
    },
  });

  if (!chunk) {
    return null;
  }

  return mapChunkSummary(chunk as PersistedChunkRecord);
}

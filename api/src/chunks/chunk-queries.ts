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

export async function findChunksByDeck(
  prisma: PrismaService,
  deckId: string,
  userId: string,
): Promise<ChunkSummary[] | null> {
  return findChunksByDeckWithOptions(
    prisma,
    deckId,
    {
      limit: 50,
      offset: 0,
      direction: 'asc',
    },
    userId,
  );
}

export async function findChunksByDeckWithOptions(
  prisma: PrismaService,
  deckId: string,
  options: {
    limit: number;
    offset: number;
    direction: 'asc' | 'desc';
  },
  userId: string,
): Promise<ChunkSummary[] | null> {
  const deckIds = await getAccessibleDeckIds(prisma, userId);
  if (!deckIds.includes(deckId)) {
    return null;
  }

  const chunks = await prisma.chunk.findMany({
    where: { deckId },
    orderBy: [
      { position: options.direction },
      { createdAt: options.direction },
    ],
    skip: options.offset,
    take: options.limit,
    include: {
      chunkCards: {
        orderBy: { sequenceIndex: 'asc' },
      },
    },
  });

  return chunks.map((chunk) => mapChunkSummary(chunk as PersistedChunkRecord));
}

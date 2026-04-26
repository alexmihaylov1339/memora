import type { PrismaService } from '../../prisma/prisma.service';

export interface PersistedChunkRecord {
  id: string;
  ownerId: string | null;
  deckId: string | null;
  title: string;
  position: number;
  createdAt: Date;
  updatedAt: Date;
  chunkCards: Array<{
    cardId: string;
    sequenceIndex: number;
    offsetDays: number | null;
  }>;
}

export interface ChunkSummary {
  id: string;
  deckId: string | null;
  title: string;
  cardIds: string[];
  position: number;
  createdAt: Date;
  updatedAt: Date;
}

export type ChunkPersistenceClient = Pick<
  PrismaService,
  'card' | 'chunk' | 'chunkCard' | 'chunkReviewState' | 'deck'
>;

export function mapChunkSummary(chunk: PersistedChunkRecord): ChunkSummary {
  return {
    id: chunk.id,
    deckId: chunk.deckId,
    title: chunk.title,
    cardIds: chunk.chunkCards.map((chunkCard) => chunkCard.cardId),
    position: chunk.position,
    createdAt: chunk.createdAt,
    updatedAt: chunk.updatedAt,
  };
}

export async function hasExistingCards(
  client: ChunkPersistenceClient,
  cardIds: string[],
  userId: string,
): Promise<boolean> {
  const cards = await client.card.findMany({
    where: {
      id: { in: cardIds },
      OR: [{ ownerId: userId }, { deck: { ownerId: userId } }],
    },
    select: { id: true },
  });

  return cards.length === cardIds.length;
}

export async function assignCardsToDeck(
  client: ChunkPersistenceClient,
  deckId: string,
  cardIds: string[],
): Promise<void> {
  if (cardIds.length === 0) {
    return;
  }

  await client.card.updateMany({
    where: { id: { in: cardIds } },
    data: { deckId },
  });
}

export async function resetChunkReviewProgress(
  client: ChunkPersistenceClient,
  chunkId: string,
  now = new Date(),
): Promise<void> {
  await client.chunkReviewState.upsert({
    where: { chunkId },
    update: {
      due: now,
      consecutiveSuccessCount: 0,
      lastGrade: null,
    },
    create: {
      chunkId,
      due: now,
      consecutiveSuccessCount: 0,
      lastGrade: null,
    },
  });
}

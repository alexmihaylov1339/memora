import type { PrismaService } from '../../prisma/prisma.service';

export interface PersistedChunkRecord {
  id: string;
  deckId: string;
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
  deckId: string;
  title: string;
  cardIds: string[];
  position: number;
  createdAt: Date;
  updatedAt: Date;
}

export type ChunkPersistenceClient = Pick<
  PrismaService,
  'card' | 'chunk' | 'chunkCard' | 'deck'
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
    where: { id: { in: cardIds }, deck: { ownerId: userId } },
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

  await client.chunkCard.deleteMany({
    where: { cardId: { in: cardIds } },
  });

  await client.card.updateMany({
    where: { id: { in: cardIds } },
    data: { deckId },
  });
}

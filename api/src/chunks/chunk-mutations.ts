import { PrismaService } from '../../prisma/prisma.service';
import {
  assignCardsToDeck,
  hasExistingCards,
  mapChunkSummary,
  type ChunkPersistenceClient,
  type ChunkSummary,
  type PersistedChunkRecord,
} from './chunks.helpers';

export interface CreateChunkInput {
  deckId: string;
  title: string;
  cardIds?: string[];
  position?: number;
}

export interface UpdateChunkInput {
  title?: string;
  cardIds?: string[];
  position?: number;
}

export type CreateChunkResult =
  | { status: 'created'; chunk: ChunkSummary }
  | { status: 'deck_not_found' }
  | { status: 'invalid_cards' };

export type UpdateChunkResult =
  | { status: 'updated'; chunk: ChunkSummary }
  | { status: 'not_found' }
  | { status: 'invalid_cards' };

export async function createChunk(
  prisma: PrismaService,
  data: CreateChunkInput,
  userId: string,
): Promise<CreateChunkResult> {
  return prisma.$transaction(async (tx) => {
    const client = tx as ChunkPersistenceClient;
    const deck = await client.deck.findFirst({
      where: { id: data.deckId, ownerId: userId },
    });
    if (!deck) {
      return { status: 'deck_not_found' } satisfies CreateChunkResult;
    }

    if (
      data.cardIds &&
      data.cardIds.length > 0 &&
      !(await hasExistingCards(client, data.cardIds, userId))
    ) {
      return { status: 'invalid_cards' } satisfies CreateChunkResult;
    }

    await assignCardsToDeck(client, data.deckId, data.cardIds ?? []);

    const chunk = await client.chunk.create({
      data: {
        deckId: data.deckId,
        title: data.title,
        position: data.position ?? 0,
        chunkCards: {
          create:
            data.cardIds?.map((cardId, index) => ({
              cardId,
              sequenceIndex: index,
            })) ?? [],
        },
      },
      include: {
        chunkCards: {
          orderBy: { sequenceIndex: 'asc' },
        },
      },
    });

    return {
      status: 'created',
      chunk: mapChunkSummary(chunk as PersistedChunkRecord),
    } satisfies CreateChunkResult;
  });
}

export async function updateChunk(
  prisma: PrismaService,
  id: string,
  data: UpdateChunkInput,
  userId: string,
): Promise<UpdateChunkResult> {
  return prisma.$transaction(async (tx) => {
    const client = tx as ChunkPersistenceClient;
    const existing = await client.chunk.findFirst({
      where: { id, deck: { ownerId: userId } },
    });

    if (!existing) {
      return { status: 'not_found' } satisfies UpdateChunkResult;
    }

    if (
      data.cardIds &&
      data.cardIds.length > 0 &&
      !(await hasExistingCards(client, data.cardIds, userId))
    ) {
      return { status: 'invalid_cards' } satisfies UpdateChunkResult;
    }

    await assignCardsToDeck(client, existing.deckId, data.cardIds ?? []);

    const chunk = await client.chunk.update({
      where: { id },
      data: {
        title: data.title,
        position: data.position,
        ...(data.cardIds !== undefined
          ? {
              chunkCards: {
                deleteMany: {},
                create: data.cardIds.map((cardId, index) => ({
                  cardId,
                  sequenceIndex: index,
                })),
              },
            }
          : {}),
      },
      include: {
        chunkCards: {
          orderBy: { sequenceIndex: 'asc' },
        },
      },
    });

    return {
      status: 'updated',
      chunk: mapChunkSummary(chunk as PersistedChunkRecord),
    } satisfies UpdateChunkResult;
  });
}

export async function removeChunk(
  prisma: PrismaService,
  id: string,
  userId: string,
): Promise<boolean> {
  const existing = await prisma.chunk.findFirst({
    where: { id, deck: { ownerId: userId } },
  });

  if (!existing) {
    return false;
  }

  await prisma.chunk.delete({ where: { id } });
  return true;
}

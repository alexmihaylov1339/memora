import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { getAccessibleDeckIds } from '../decks/deck-access';
import {
  assignCardsToDeck,
  hasExistingCards,
  mapChunkSummary,
  type ChunkPersistenceClient,
  type ChunkSummary,
  type PersistedChunkRecord,
} from './chunks.helpers';
export type { ChunkSummary } from './chunks.helpers';

interface CreateChunkInput {
  deckId: string;
  title: string;
  cardIds?: string[];
  position?: number;
}

interface UpdateChunkInput {
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

@Injectable()
export class ChunksService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(userId: string): Promise<ChunkSummary[]> {
    const deckIds = await getAccessibleDeckIds(this.prisma, userId);
    if (deckIds.length === 0) {
      return [];
    }

    const chunks = await this.prisma.chunk.findMany({
      where: { deckId: { in: deckIds } },
      orderBy: [{ updatedAt: 'desc' }, { createdAt: 'desc' }],
      include: {
        chunkCards: {
          orderBy: { sequenceIndex: 'asc' },
        },
      },
    });

    return chunks.map((chunk) =>
      mapChunkSummary(chunk as PersistedChunkRecord),
    );
  }

  async create(
    data: CreateChunkInput,
    userId: string,
  ): Promise<CreateChunkResult> {
    return this.prisma.$transaction(async (tx) => {
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

  async findOne(id: string, userId: string): Promise<ChunkSummary | null> {
    const deckIds = await getAccessibleDeckIds(this.prisma, userId);

    if (deckIds.length === 0) {
      return null;
    }

    const chunk = await this.prisma.chunk.findFirst({
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

  async findByDeck(
    deckId: string,
    userId: string,
  ): Promise<ChunkSummary[] | null> {
    return this.findByDeckWithOptions(
      deckId,
      {
        limit: 50,
        offset: 0,
        direction: 'asc',
      },
      userId,
    );
  }

  async findByDeckWithOptions(
    deckId: string,
    options: {
      limit: number;
      offset: number;
      direction: 'asc' | 'desc';
    },
    userId: string,
  ): Promise<ChunkSummary[] | null> {
    const deckIds = await getAccessibleDeckIds(this.prisma, userId);
    if (!deckIds.includes(deckId)) {
      return null;
    }

    const chunks = await this.prisma.chunk.findMany({
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

    return chunks.map((chunk) =>
      mapChunkSummary(chunk as PersistedChunkRecord),
    );
  }

  async update(
    id: string,
    data: UpdateChunkInput,
    userId: string,
  ): Promise<UpdateChunkResult> {
    return this.prisma.$transaction(async (tx) => {
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

  async remove(id: string, userId: string) {
    const existing = await this.prisma.chunk.findFirst({
      where: { id, deck: { ownerId: userId } },
    });
    if (!existing) {
      return false;
    }

    await this.prisma.chunk.delete({ where: { id } });
    return true;
  }
}

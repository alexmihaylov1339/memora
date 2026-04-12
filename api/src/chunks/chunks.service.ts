import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

interface PersistedChunkRecord {
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

export interface ChunkSummary {
  id: string;
  deckId: string;
  title: string;
  cardIds: string[];
  position: number;
  createdAt: Date;
  updatedAt: Date;
}

export type CreateChunkResult =
  | { status: 'created'; chunk: ChunkSummary }
  | { status: 'deck_not_found' }
  | { status: 'invalid_cards' };

export type UpdateChunkResult =
  | { status: 'updated'; chunk: ChunkSummary }
  | { status: 'not_found' }
  | { status: 'invalid_cards' };

type ChunkPersistenceClient = Pick<
  PrismaService,
  'card' | 'chunk' | 'chunkCard' | 'deck'
>;

@Injectable()
export class ChunksService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<ChunkSummary[]> {
    const chunks = await this.prisma.chunk.findMany({
      orderBy: [{ updatedAt: 'desc' }, { createdAt: 'desc' }],
      include: {
        chunkCards: {
          orderBy: { sequenceIndex: 'asc' },
        },
      },
    });

    return chunks.map((chunk) =>
      this.mapChunkSummary(chunk as PersistedChunkRecord),
    );
  }

  private async hasExistingCards(
    client: ChunkPersistenceClient,
    cardIds: string[],
  ): Promise<boolean> {
    const cards = await client.card.findMany({
      where: { id: { in: cardIds } },
      select: { id: true },
    });

    return cards.length === cardIds.length;
  }

  private async assignCardsToDeck(
    client: ChunkPersistenceClient,
    deckId: string,
    cardIds: string[],
  ) {
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

  private mapChunkSummary(chunk: PersistedChunkRecord): ChunkSummary {
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

  async create(data: CreateChunkInput): Promise<CreateChunkResult> {
    return this.prisma.$transaction(async (tx) => {
      const client = tx as ChunkPersistenceClient;
      const deck = await client.deck.findUnique({
        where: { id: data.deckId },
      });
      if (!deck) {
        return { status: 'deck_not_found' } satisfies CreateChunkResult;
      }

      if (
        data.cardIds &&
        data.cardIds.length > 0 &&
        !(await this.hasExistingCards(client, data.cardIds))
      ) {
        return { status: 'invalid_cards' } satisfies CreateChunkResult;
      }

      await this.assignCardsToDeck(client, data.deckId, data.cardIds ?? []);

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
        chunk: this.mapChunkSummary(chunk as PersistedChunkRecord),
      } satisfies CreateChunkResult;
    });
  }

  async findOne(id: string): Promise<ChunkSummary | null> {
    const chunk = await this.prisma.chunk.findUnique({
      where: { id },
      include: {
        chunkCards: {
          orderBy: { sequenceIndex: 'asc' },
        },
      },
    });

    if (!chunk) {
      return null;
    }

    return this.mapChunkSummary(chunk as PersistedChunkRecord);
  }

  async findByDeck(deckId: string): Promise<ChunkSummary[] | null> {
    return this.findByDeckWithOptions(deckId, {
      limit: 50,
      offset: 0,
      direction: 'asc',
    });
  }

  async findByDeckWithOptions(
    deckId: string,
    options: {
      limit: number;
      offset: number;
      direction: 'asc' | 'desc';
    },
  ): Promise<ChunkSummary[] | null> {
    const deck = await this.prisma.deck.findUnique({
      where: { id: deckId },
      select: { id: true },
    });
    if (!deck) {
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
      this.mapChunkSummary(chunk as PersistedChunkRecord),
    );
  }

  async update(id: string, data: UpdateChunkInput): Promise<UpdateChunkResult> {
    return this.prisma.$transaction(async (tx) => {
      const client = tx as ChunkPersistenceClient;
      const existing = await client.chunk.findUnique({ where: { id } });

      if (!existing) {
        return { status: 'not_found' } satisfies UpdateChunkResult;
      }

      if (
        data.cardIds &&
        data.cardIds.length > 0 &&
        !(await this.hasExistingCards(client, data.cardIds))
      ) {
        return { status: 'invalid_cards' } satisfies UpdateChunkResult;
      }

      await this.assignCardsToDeck(client, existing.deckId, data.cardIds ?? []);

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
        chunk: this.mapChunkSummary(chunk as PersistedChunkRecord),
      } satisfies UpdateChunkResult;
    });
  }

  async remove(id: string) {
    const existing = await this.prisma.chunk.findUnique({ where: { id } });
    if (!existing) {
      return false;
    }

    await this.prisma.chunk.delete({ where: { id } });
    return true;
  }
}

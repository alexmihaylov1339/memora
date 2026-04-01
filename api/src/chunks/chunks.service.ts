import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

type ChunkRecord = {
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
};

@Injectable()
export class ChunksService {
  constructor(private prisma: PrismaService) {}

  private serializeChunk(chunk: ChunkRecord) {
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

  async create(data: {
    deckId: string;
    title: string;
    cardIds?: string[];
    position?: number;
  }) {
    const deck = await this.prisma.deck.findUnique({
      where: { id: data.deckId },
    });
    if (!deck) {
      return null;
    }

    if (data.cardIds && data.cardIds.length > 0) {
      const cards = await this.prisma.card.findMany({
        where: { id: { in: data.cardIds } },
        select: { id: true, deckId: true },
      });

      if (
        cards.length !== data.cardIds.length ||
        cards.some((card) => card.deckId !== data.deckId)
      ) {
        return null;
      }
    }

    const chunk = await this.prisma.chunk.create({
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

    return this.serializeChunk(chunk as ChunkRecord);
  }

  async findOne(id: string) {
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

    return this.serializeChunk(chunk as ChunkRecord);
  }

  async findByDeck(deckId: string) {
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
  ) {
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

    return chunks.map((chunk) => this.serializeChunk(chunk as ChunkRecord));
  }

  async update(
    id: string,
    data: {
      title?: string;
      cardIds?: string[];
      position?: number;
    },
  ) {
    const existing = await this.prisma.chunk.findUnique({ where: { id } });
    
    if (!existing) {
      return null;
    }

    if (data.cardIds && data.cardIds.length > 0) {
      const cards = await this.prisma.card.findMany({
        where: { id: { in: data.cardIds } },
        select: { id: true, deckId: true },
      });

      if (
        cards.length !== data.cardIds.length ||
        cards.some((card) => card.deckId !== existing.deckId)
      ) {
        return null;
      }
    }

    const chunk = await this.prisma.chunk.update({
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

    return this.serializeChunk(chunk as ChunkRecord);
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

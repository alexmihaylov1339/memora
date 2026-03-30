import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ChunksService {
  constructor(private prisma: PrismaService) {}

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

    return this.prisma.chunk.create({
      data: {
        deckId: data.deckId,
        title: data.title,
        cardIds: data.cardIds ?? [],
        position: data.position ?? 0,
      },
    });
  }

  findOne(id: string) {
    return this.prisma.chunk.findUnique({ where: { id } });
  }

  async findByDeck(deckId: string) {
    const deck = await this.prisma.deck.findUnique({
      where: { id: deckId },
      select: { id: true },
    });
    if (!deck) {
      return null;
    }

    return this.prisma.chunk.findMany({
      where: { deckId },
      orderBy: [{ position: 'asc' }, { createdAt: 'asc' }],
    });
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

    return this.prisma.chunk.update({
      where: { id },
      data,
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

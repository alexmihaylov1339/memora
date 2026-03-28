import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class DecksService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    const decks = await this.prisma.deck.findMany({
      include: {
        _count: {
          select: { cards: true },
        },
      },
    });

    return decks.map((deck) => ({
      id: deck.id,
      name: deck.name,
      count: deck._count.cards,
    }));
  }

  async create(name: string, description?: string) {
    return this.prisma.deck.create({
      data: { name, description },
    });
  }

  async findOne(id: string) {
    const deck = await this.prisma.deck.findUnique({
      where: { id },
      include: {
        _count: {
          select: { cards: true },
        },
      },
    });

    if (!deck) {
      return null;
    }

    return {
      id: deck.id,
      name: deck.name,
      description: deck.description ?? undefined,
      count: deck._count.cards,
      createdAt: deck.createdAt,
      updatedAt: deck.updatedAt,
    };
  }

  async update(id: string, data: { name?: string; description?: string }) {
    const existing = await this.prisma.deck.findUnique({ where: { id } });
    if (!existing) {
      return null;
    }

    const deck = await this.prisma.deck.update({
      where: { id },
      data,
      include: {
        _count: {
          select: { cards: true },
        },
      },
    });

    return {
      id: deck.id,
      name: deck.name,
      description: deck.description ?? undefined,
      count: deck._count.cards,
      createdAt: deck.createdAt,
      updatedAt: deck.updatedAt,
    };
  }

  async remove(id: string) {
    const existing = await this.prisma.deck.findUnique({ where: { id } });
    if (!existing) {
      return false;
    }

    await this.prisma.deck.delete({ where: { id } });
    return true;
  }
}

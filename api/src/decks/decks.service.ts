import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

export interface DeckListItem {
  id: string;
  name: string;
  count: number;
}

export interface DeckRecord {
  id: string;
  name: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface DeckDetail extends DeckRecord {
  count: number;
}

@Injectable()
export class DecksService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<DeckListItem[]> {
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
    })) as DeckListItem[];
  }

  async create(name: string, description?: string): Promise<DeckRecord> {
    return (await this.prisma.deck.create({
      data: { name, description },
    })) as DeckRecord;
  }

  async findOne(id: string): Promise<DeckDetail | null> {
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
    } as DeckDetail;
  }

  async update(
    id: string,
    data: { name?: string; description?: string },
  ): Promise<DeckDetail | null> {
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
    } as DeckDetail;
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

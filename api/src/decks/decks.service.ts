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
}


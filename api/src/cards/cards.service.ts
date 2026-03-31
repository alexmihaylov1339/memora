import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import type { Prisma } from '@prisma/client';

@Injectable()
export class CardsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: {
    deckId: string;
    kind: string;
    fields: Prisma.JsonObject;
  }) {
    const deck = await this.prisma.deck.findUnique({
      where: { id: data.deckId },
    });
    if (!deck) {
      return null;
    }

    return this.prisma.card.create({
      data: {
        deckId: data.deckId,
        kind: data.kind,
        fields: data.fields,
      },
    });
  }

  async findOne(id: string) {
    return this.prisma.card.findUnique({ where: { id } });
  }

  async update(
    id: string,
    data: { kind?: string; fields?: Prisma.JsonObject },
  ) {
    const existing = await this.prisma.card.findUnique({ where: { id } });
    if (!existing) {
      return null;
    }

    return this.prisma.card.update({
      where: { id },
      data,
    });
  }

  async remove(id: string) {
    const existing = await this.prisma.card.findUnique({ where: { id } });
    if (!existing) {
      return false;
    }

    await this.prisma.card.delete({ where: { id } });
    return true;
  }
}

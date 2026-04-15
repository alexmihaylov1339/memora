import { Injectable } from '@nestjs/common';
import type { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

export interface CardRecord {
  id: string;
  deckId: string;
  kind: string;
  fields: Prisma.JsonValue;
  createdAt: Date;
}

@Injectable()
export class CardsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(userId: string): Promise<CardRecord[]> {
    return (await this.prisma.card.findMany({
      where: { deck: { ownerId: userId } },
      orderBy: [{ createdAt: 'desc' }, { id: 'asc' }],
    })) as CardRecord[];
  }

  async create(
    data: { deckId: string; kind: string; fields: Prisma.JsonObject },
    userId: string,
  ): Promise<CardRecord | null> {
    const deck = await this.prisma.deck.findFirst({
      where: { id: data.deckId, ownerId: userId },
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
    }) as Promise<CardRecord>;
  }

  async findOne(id: string, userId: string): Promise<CardRecord | null> {
    return (await this.prisma.card.findFirst({
      where: { id, deck: { ownerId: userId } },
    })) as CardRecord | null;
  }

  async update(
    id: string,
    data: { kind?: string; fields?: Prisma.JsonObject },
    userId: string,
  ): Promise<CardRecord | null> {
    const existing = await this.prisma.card.findFirst({
      where: { id, deck: { ownerId: userId } },
    });
    if (!existing) {
      return null;
    }

    return (await this.prisma.card.update({
      where: { id },
      data,
    })) as CardRecord;
  }

  async remove(id: string, userId: string) {
    const existing = await this.prisma.card.findFirst({
      where: { id, deck: { ownerId: userId } },
    });
    if (!existing) {
      return false;
    }

    await this.prisma.card.delete({ where: { id } });
    return true;
  }
}

import { Injectable } from '@nestjs/common';
import type { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { getAccessibleDeckIds } from '../decks/deck-access';

export interface CardRecord {
  id: string;
  ownerId: string | null;
  deckId: string | null;
  kind: string;
  fields: Prisma.JsonValue;
  createdAt: Date;
}

@Injectable()
export class CardsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(userId: string): Promise<CardRecord[]> {
    const deckIds = await getAccessibleDeckIds(this.prisma, userId);

    return (await this.prisma.card.findMany({
      where: {
        OR: [
          { ownerId: userId },
          ...(deckIds.length > 0 ? [{ deckId: { in: deckIds } }] : []),
        ],
      },
      orderBy: [{ createdAt: 'desc' }, { id: 'asc' }],
    })) as CardRecord[];
  }

  async create(
    data: { deckId?: string; kind: string; fields: Prisma.JsonObject },
    userId: string,
  ): Promise<CardRecord | null> {
    if (data.deckId) {
      const deck = await this.prisma.deck.findFirst({
        where: { id: data.deckId, ownerId: userId },
      });
      if (!deck) {
        return null;
      }
    }

    return this.prisma.card.create({
      data: {
        ownerId: userId,
        deckId: data.deckId ?? null,
        kind: data.kind,
        fields: data.fields,
      },
    }) as Promise<CardRecord>;
  }

  async findOne(id: string, userId: string): Promise<CardRecord | null> {
    const deckIds = await getAccessibleDeckIds(this.prisma, userId);

    return (await this.prisma.card.findFirst({
      where: {
        id,
        OR: [
          { ownerId: userId },
          ...(deckIds.length > 0 ? [{ deckId: { in: deckIds } }] : []),
        ],
      },
    })) as CardRecord | null;
  }

  async update(
    id: string,
    data: { kind?: string; fields?: Prisma.JsonObject },
    userId: string,
  ): Promise<CardRecord | null> {
    const existing = await this.prisma.card.findFirst({
      where: { id, ownerId: userId },
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
      where: { id, ownerId: userId },
    });
    if (!existing) {
      return false;
    }

    await this.prisma.card.delete({ where: { id } });
    return true;
  }
}

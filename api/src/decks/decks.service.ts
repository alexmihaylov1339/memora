import { Injectable } from '@nestjs/common';
import type { CardRecord } from '../cards/cards.service';
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

type CreateDeckResult =
  | { status: 'created'; deck: DeckRecord }
  | { status: 'invalid_cards' };

type UpdateDeckResult =
  | { status: 'updated'; deck: DeckDetail }
  | { status: 'not_found' }
  | { status: 'invalid_cards' };

@Injectable()
export class DecksService {
  constructor(private readonly prisma: PrismaService) {}

  private async hasExistingCards(cardIds: string[]): Promise<boolean> {
    const cards = await this.prisma.card.findMany({
      where: { id: { in: cardIds } },
      select: { id: true },
    });

    return cards.length === cardIds.length;
  }

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

  async create(
    name: string,
    description?: string,
    cardIds: string[] = [],
  ): Promise<CreateDeckResult> {
    if (cardIds.length > 0 && !(await this.hasExistingCards(cardIds))) {
      return { status: 'invalid_cards' };
    }

    return this.prisma.$transaction(async (tx) => {
      const deck = (await tx.deck.create({
        data: { name, description },
      })) as DeckRecord;

      if (cardIds.length > 0) {
        await tx.chunkCard.deleteMany({
          where: { cardId: { in: cardIds } },
        });

        await tx.card.updateMany({
          where: { id: { in: cardIds } },
          data: { deckId: deck.id },
        });
      }

      return { status: 'created', deck } satisfies CreateDeckResult;
    });
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
    data: { name?: string; description?: string; cardIds?: string[] },
  ): Promise<UpdateDeckResult> {
    const existing = await this.prisma.deck.findUnique({ where: { id } });
    if (!existing) {
      return { status: 'not_found' };
    }

    if (
      data.cardIds &&
      data.cardIds.length > 0 &&
      !(await this.hasExistingCards(data.cardIds))
    ) {
      return { status: 'invalid_cards' };
    }

    return this.prisma.$transaction(async (tx) => {
      if (data.cardIds && data.cardIds.length > 0) {
        await tx.chunkCard.deleteMany({
          where: { cardId: { in: data.cardIds } },
        });

        await tx.card.updateMany({
          where: { id: { in: data.cardIds } },
          data: { deckId: id },
        });
      }

      const deckData = {
        name: data.name,
        description: data.description,
      };
      const deck = await tx.deck.update({
        where: { id },
        data: deckData,
        include: {
          _count: {
            select: { cards: true },
          },
        },
      });

      return {
        status: 'updated',
        deck: {
          id: deck.id,
          name: deck.name,
          description: deck.description ?? undefined,
          count: deck._count.cards,
          createdAt: deck.createdAt,
          updatedAt: deck.updatedAt,
        } as DeckDetail,
      } satisfies UpdateDeckResult;
    });
  }

  async remove(id: string) {
    const existing = await this.prisma.deck.findUnique({ where: { id } });
    if (!existing) {
      return false;
    }

    await this.prisma.deck.delete({ where: { id } });
    return true;
  }

  async findCards(id: string): Promise<CardRecord[] | null> {
    const deck = await this.prisma.deck.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!deck) {
      return null;
    }

    return (await this.prisma.card.findMany({
      where: { deckId: id },
      orderBy: [{ createdAt: 'asc' }, { id: 'asc' }],
    })) as CardRecord[];
  }
}

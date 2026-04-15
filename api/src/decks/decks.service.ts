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
  | { status: 'invalid_cards' }
  | { status: 'invalid_chunks' };

type UpdateDeckResult =
  | { status: 'updated'; deck: DeckDetail }
  | { status: 'not_found' }
  | { status: 'invalid_cards' }
  | { status: 'invalid_chunks' };

@Injectable()
export class DecksService {
  constructor(private readonly prisma: PrismaService) {}

  private async hasExistingCards(
    cardIds: string[],
    userId: string,
  ): Promise<boolean> {
    const cards = await this.prisma.card.findMany({
      where: { id: { in: cardIds }, deck: { ownerId: userId } },
      select: { id: true },
    });

    return cards.length === cardIds.length;
  }

  private async hasExistingChunks(
    chunkIds: string[],
    userId: string,
  ): Promise<boolean> {
    const chunks = await this.prisma.chunk.findMany({
      where: { id: { in: chunkIds }, deck: { ownerId: userId } },
      select: { id: true },
    });

    return chunks.length === chunkIds.length;
  }

  async findAll(userId: string): Promise<DeckListItem[]> {
    const decks = await this.prisma.deck.findMany({
      where: { ownerId: userId },
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
    chunkIds: string[] = [],
    userId: string = '',
  ): Promise<CreateDeckResult> {
    if (cardIds.length > 0 && !(await this.hasExistingCards(cardIds, userId))) {
      return { status: 'invalid_cards' };
    }

    if (
      chunkIds.length > 0 &&
      !(await this.hasExistingChunks(chunkIds, userId))
    ) {
      return { status: 'invalid_chunks' };
    }

    return this.prisma.$transaction(async (tx) => {
      const deck = (await tx.deck.create({
        data: { name, description, ownerId: userId },
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

      if (chunkIds.length > 0) {
        await tx.chunk.updateMany({
          where: { id: { in: chunkIds } },
          data: { deckId: deck.id },
        });
      }

      return { status: 'created', deck } satisfies CreateDeckResult;
    });
  }

  async findOne(id: string, userId: string): Promise<DeckDetail | null> {
    const deck = await this.prisma.deck.findFirst({
      where: { id, ownerId: userId },
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
    data: {
      name?: string;
      description?: string;
      cardIds?: string[];
      chunkIds?: string[];
    },
    userId: string,
  ): Promise<UpdateDeckResult> {
    const existing = await this.prisma.deck.findFirst({
      where: { id, ownerId: userId },
    });
    if (!existing) {
      return { status: 'not_found' };
    }

    if (
      data.cardIds &&
      data.cardIds.length > 0 &&
      !(await this.hasExistingCards(data.cardIds, userId))
    ) {
      return { status: 'invalid_cards' };
    }

    if (
      data.chunkIds &&
      data.chunkIds.length > 0 &&
      !(await this.hasExistingChunks(data.chunkIds, userId))
    ) {
      return { status: 'invalid_chunks' };
    }

    return this.prisma.$transaction(async (tx) => {
      if (data.cardIds !== undefined) {
        // Delete cards in this deck that are no longer in the selection
        await tx.card.deleteMany({
          where: { deckId: id, id: { notIn: data.cardIds } },
        });

        if (data.cardIds.length > 0) {
          // Remove newly-added cards from any existing chunk associations
          await tx.chunkCard.deleteMany({
            where: { cardId: { in: data.cardIds } },
          });

          // Move newly-added cards into this deck
          await tx.card.updateMany({
            where: { id: { in: data.cardIds } },
            data: { deckId: id },
          });
        }
      }

      if (data.chunkIds !== undefined) {
        // Delete chunks in this deck that are no longer in the selection
        await tx.chunk.deleteMany({
          where: { deckId: id, id: { notIn: data.chunkIds } },
        });

        if (data.chunkIds.length > 0) {
          // Move newly-added chunks into this deck
          await tx.chunk.updateMany({
            where: { id: { in: data.chunkIds } },
            data: { deckId: id },
          });
        }
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

  async remove(id: string, userId: string) {
    const existing = await this.prisma.deck.findFirst({
      where: { id, ownerId: userId },
    });
    if (!existing) {
      return false;
    }

    await this.prisma.deck.delete({ where: { id } });
    return true;
  }

  async findCards(id: string, userId: string): Promise<CardRecord[] | null> {
    const deck = await this.prisma.deck.findFirst({
      where: { id, ownerId: userId },
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

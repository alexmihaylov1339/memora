import { Injectable } from '@nestjs/common';
import type { CardRecord } from '../cards/cards.service';
import { PrismaService } from '../../prisma/prisma.service';
import type { DeckSharePermission } from './deck-share.types';
import { getAccessibleDeckIds } from './deck-access';
import {
  attachCardsToDeck,
  attachChunksToDeck,
  findOwnedDeck,
  hasExistingCards,
  hasExistingChunks,
  mapDeckDetail,
  mapDeckShareSummary,
  replaceDeckCards,
  replaceDeckChunks,
  resolveShareTarget,
  type DeckDetail,
  type DeckListItem,
  type DeckRecord,
  type DeckShareSummary,
  type DeckShareWithUser,
  type DeckWithShares,
} from './decks.helpers';
export type {
  DeckDetail,
  DeckListItem,
  DeckRecord,
  DeckShareSummary,
} from './decks.helpers';

type CreateDeckResult =
  | { status: 'created'; deck: DeckRecord }
  | { status: 'invalid_cards' }
  | { status: 'invalid_chunks' };

type UpdateDeckResult =
  | { status: 'updated'; deck: DeckDetail }
  | { status: 'not_found' }
  | { status: 'invalid_cards' }
  | { status: 'invalid_chunks' };

type ShareDeckResult =
  | { status: 'shared'; share: DeckShareSummary }
  | { status: 'not_found' }
  | { status: 'share_target_not_found' }
  | { status: 'share_target_ambiguous' }
  | { status: 'already_shared' }
  | { status: 'cannot_share_with_self' };

@Injectable()
export class DecksService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(userId: string): Promise<DeckListItem[]> {
    const deckIds = await getAccessibleDeckIds(this.prisma, userId);

    if (deckIds.length === 0) {
      return [];
    }

    const decks = await this.prisma.deck.findMany({
      where: { id: { in: deckIds } },
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
    if (
      cardIds.length > 0 &&
      !(await hasExistingCards(this.prisma, cardIds, userId))
    ) {
      return { status: 'invalid_cards' };
    }

    if (
      chunkIds.length > 0 &&
      !(await hasExistingChunks(this.prisma, chunkIds, userId))
    ) {
      return { status: 'invalid_chunks' };
    }

    return this.prisma.$transaction(async (tx) => {
      const deck = (await tx.deck.create({
        data: { name, description, ownerId: userId },
      })) as DeckRecord;

      await attachCardsToDeck(tx, deck.id, cardIds);
      await attachChunksToDeck(tx, deck.id, chunkIds);

      return { status: 'created', deck } satisfies CreateDeckResult;
    });
  }

  async findOne(id: string, userId: string): Promise<DeckDetail | null> {
    const deckIds = await getAccessibleDeckIds(this.prisma, userId);

    if (!deckIds.includes(id)) {
      return null;
    }

    const deck = (await this.prisma.deck.findFirst({
      where: { id },
      include: {
        _count: {
          select: { cards: true },
        },
        shares: {
          orderBy: [{ createdAt: 'asc' }, { id: 'asc' }],
          include: {
            user: {
              select: {
                id: true,
                email: true,
                name: true,
                createdAt: true,
                updatedAt: true,
              },
            },
          },
        },
      },
    })) as DeckWithShares | null;

    if (!deck) {
      return null;
    }

    return mapDeckDetail(deck);
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
      !(await hasExistingCards(this.prisma, data.cardIds, userId))
    ) {
      return { status: 'invalid_cards' };
    }

    if (
      data.chunkIds &&
      data.chunkIds.length > 0 &&
      !(await hasExistingChunks(this.prisma, data.chunkIds, userId))
    ) {
      return { status: 'invalid_chunks' };
    }

    return this.prisma.$transaction(async (tx) => {
      if (data.cardIds !== undefined) {
        await replaceDeckCards(tx, id, data.cardIds);
      }

      if (data.chunkIds !== undefined) {
        await replaceDeckChunks(tx, id, data.chunkIds);
      }

      const deckData = {
        name: data.name,
        description: data.description,
      };
      const deck = (await tx.deck.update({
        where: { id },
        data: deckData,
        include: {
          _count: {
            select: { cards: true },
          },
          shares: {
            orderBy: [{ createdAt: 'asc' }, { id: 'asc' }],
            include: {
              user: {
                select: {
                  id: true,
                  email: true,
                  name: true,
                  createdAt: true,
                  updatedAt: true,
                },
              },
            },
          },
        },
      })) as DeckWithShares;

      return {
        status: 'updated',
        deck: mapDeckDetail(deck),
      } satisfies UpdateDeckResult;
    });
  }

  async remove(id: string, userId: string) {
    const existing = await findOwnedDeck(this.prisma, id, userId);
    if (!existing) {
      return false;
    }

    await this.prisma.deck.delete({ where: { id } });
    return true;
  }

  async findCards(id: string, userId: string): Promise<CardRecord[] | null> {
    const deckIds = await getAccessibleDeckIds(this.prisma, userId);
    if (!deckIds.includes(id)) {
      return null;
    }

    return (await this.prisma.card.findMany({
      where: { deckId: id },
      orderBy: [{ createdAt: 'asc' }, { id: 'asc' }],
    })) as CardRecord[];
  }

  async listShares(
    deckId: string,
    userId: string,
  ): Promise<DeckShareSummary[] | null> {
    const deck = await findOwnedDeck(this.prisma, deckId, userId);
    if (!deck) {
      return null;
    }

    const shares = (await this.prisma.deckShare.findMany({
      where: { deckId },
      orderBy: [{ createdAt: 'asc' }, { id: 'asc' }],
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            createdAt: true,
            updatedAt: true,
          },
        },
      },
    })) as DeckShareWithUser[];

    return shares.map((share) => mapDeckShareSummary(share));
  }

  async shareDeck(
    deckId: string,
    identifier: string,
    permission: DeckSharePermission,
    userId: string,
  ): Promise<ShareDeckResult> {
    const deck = await findOwnedDeck(this.prisma, deckId, userId);
    if (!deck) {
      return { status: 'not_found' };
    }

    const target = await resolveShareTarget(this.prisma, identifier);
    if (target.status !== 'found') {
      return {
        status:
          target.status === 'ambiguous'
            ? 'share_target_ambiguous'
            : 'share_target_not_found',
      };
    }

    if (target.user.id === userId) {
      return { status: 'cannot_share_with_self' };
    }

    const existing = await this.prisma.deckShare.findUnique({
      where: {
        deckId_userId: {
          deckId,
          userId: target.user.id,
        },
      },
    });

    if (existing) {
      return { status: 'already_shared' };
    }

    const share = await this.prisma.deckShare.create({
      data: {
        deckId,
        userId: target.user.id,
        permission,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            createdAt: true,
            updatedAt: true,
          },
        },
      },
    });

    return {
      status: 'shared',
      share: {
        id: share.id,
        deckId: share.deckId,
        userId: share.user.id,
        email: share.user.email,
        name: share.user.name ?? undefined,
        permission: share.permission,
        createdAt: share.createdAt,
        updatedAt: share.updatedAt,
      },
    };
  }

  async removeShare(
    deckId: string,
    sharedUserId: string,
    userId: string,
  ): Promise<boolean> {
    const deck = await findOwnedDeck(this.prisma, deckId, userId);
    if (!deck) {
      return false;
    }

    const result = await this.prisma.deckShare.deleteMany({
      where: {
        deckId,
        userId: sharedUserId,
      },
    });

    return result.count > 0;
  }
}

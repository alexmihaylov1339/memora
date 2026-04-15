import { Injectable } from '@nestjs/common';
import type { Prisma } from '@prisma/client';
import type { CardRecord } from '../cards/cards.service';
import { PrismaService } from '../../prisma/prisma.service';
import type { DeckSharePermission } from './deck-share.types';

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
  sharedUsers: DeckShareSummary[];
}

export interface DeckShareSummary {
  id: string;
  deckId: string;
  userId: string;
  email: string;
  name?: string;
  permission: DeckSharePermission;
  createdAt: Date;
  updatedAt: Date;
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

type ShareDeckResult =
  | { status: 'shared'; share: DeckShareSummary }
  | { status: 'not_found' }
  | { status: 'share_target_not_found' }
  | { status: 'share_target_ambiguous' }
  | { status: 'already_shared' }
  | { status: 'cannot_share_with_self' };

type DeckShareWithUser = Prisma.DeckShareGetPayload<{
  include: {
    user: {
      select: {
        id: true;
        email: true;
        name: true;
        createdAt: true;
        updatedAt: true;
      };
    };
  };
}>;

type DeckWithShares = Prisma.DeckGetPayload<{
  include: {
    _count: {
      select: { cards: true };
    };
    shares: {
      orderBy: [{ createdAt: 'asc' }, { id: 'asc' }];
      include: {
        user: {
          select: {
            id: true;
            email: true;
            name: true;
            createdAt: true;
            updatedAt: true;
          };
        };
      };
    };
  };
}>;

@Injectable()
export class DecksService {
  constructor(private readonly prisma: PrismaService) {}

  private async findOwnedDeck(id: string, userId: string) {
    return this.prisma.deck.findFirst({
      where: { id, ownerId: userId },
      select: { id: true },
    });
  }

  private mapDeckShareSummary(share: DeckShareWithUser): DeckShareSummary {
    return {
      id: share.id,
      deckId: share.deckId,
      userId: share.user.id,
      email: share.user.email,
      name: share.user.name ?? undefined,
      permission: share.permission,
      createdAt: share.createdAt,
      updatedAt: share.updatedAt,
    };
  }

  private mapDeckDetail(deck: DeckWithShares): DeckDetail {
    return {
      id: deck.id,
      name: deck.name,
      description: deck.description ?? undefined,
      count: deck._count.cards,
      createdAt: deck.createdAt,
      updatedAt: deck.updatedAt,
      sharedUsers: deck.shares.map((share) => this.mapDeckShareSummary(share)),
    };
  }

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
    const deck = (await this.prisma.deck.findFirst({
      where: { id, ownerId: userId },
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

    return this.mapDeckDetail(deck);
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
        deck: this.mapDeckDetail(deck),
      } satisfies UpdateDeckResult;
    });
  }

  async remove(id: string, userId: string) {
    const existing = await this.findOwnedDeck(id, userId);
    if (!existing) {
      return false;
    }

    await this.prisma.deck.delete({ where: { id } });
    return true;
  }

  async findCards(id: string, userId: string): Promise<CardRecord[] | null> {
    const deck = await this.findOwnedDeck(id, userId);

    if (!deck) {
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
    const deck = await this.findOwnedDeck(deckId, userId);
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

    return shares.map((share) => this.mapDeckShareSummary(share));
  }

  async shareDeck(
    deckId: string,
    identifier: string,
    permission: DeckSharePermission,
    userId: string,
  ): Promise<ShareDeckResult> {
    const deck = await this.findOwnedDeck(deckId, userId);
    if (!deck) {
      return { status: 'not_found' };
    }

    const target = await this.resolveShareTarget(identifier);
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
    const deck = await this.findOwnedDeck(deckId, userId);
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

  private async resolveShareTarget(identifier: string): Promise<
    | {
        status: 'found';
        user: { id: string; email: string; name: string | null };
      }
    | { status: 'not_found' }
    | { status: 'ambiguous' }
  > {
    const normalized = identifier.trim();
    const emailCandidate = normalized.toLowerCase();

    const byEmail = await this.prisma.user.findUnique({
      where: { email: emailCandidate },
      select: { id: true, email: true, name: true },
    });

    if (byEmail) {
      return { status: 'found', user: byEmail };
    }

    const byName = await this.prisma.user.findMany({
      where: { name: normalized },
      select: { id: true, email: true, name: true },
    });

    if (byName.length === 0) {
      return { status: 'not_found' };
    }

    if (byName.length > 1) {
      return { status: 'ambiguous' };
    }

    return { status: 'found', user: byName[0] };
  }
}

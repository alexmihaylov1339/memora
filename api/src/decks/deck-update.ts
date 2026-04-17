import { PrismaService } from '../../prisma/prisma.service';
import {
  hasExistingCards,
  hasExistingChunks,
  replaceDeckCards,
  replaceDeckChunks,
} from './decks.helpers';
import type { UpdateDeckResult } from './decks.types';

export async function updateDeck(
  prisma: PrismaService,
  id: string,
  data: {
    name?: string;
    description?: string;
    cardIds?: string[];
    chunkIds?: string[];
  },
  userId: string,
): Promise<UpdateDeckResult> {
  const existing = await prisma.deck.findFirst({
    where: { id, ownerId: userId },
  });
  if (!existing) {
    return { status: 'not_found' };
  }

  if (
    data.cardIds &&
    data.cardIds.length > 0 &&
    !(await hasExistingCards(prisma, data.cardIds, userId))
  ) {
    return { status: 'invalid_cards' };
  }

  if (
    data.chunkIds &&
    data.chunkIds.length > 0 &&
    !(await hasExistingChunks(prisma, data.chunkIds, userId))
  ) {
    return { status: 'invalid_chunks' };
  }

  return prisma.$transaction(async (tx) => {
    if (data.cardIds !== undefined) {
      await replaceDeckCards(tx, id, data.cardIds);
    }

    if (data.chunkIds !== undefined) {
      await replaceDeckChunks(tx, id, data.chunkIds);
    }

    const deck = await tx.deck.update({
      where: { id },
      data: {
        name: data.name,
        description: data.description,
      },
      include: {
        _count: { select: { cards: true } },
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
        sharedUsers: deck.shares.map((share) => ({
          id: share.id,
          deckId: share.deckId,
          userId: share.user.id,
          email: share.user.email,
          name: share.user.name ?? undefined,
          permission: share.permission,
          createdAt: share.createdAt,
          updatedAt: share.updatedAt,
        })),
      },
    } satisfies UpdateDeckResult;
  });
}

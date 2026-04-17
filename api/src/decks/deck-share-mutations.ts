import { PrismaService } from '../../prisma/prisma.service';
import type { DeckSharePermission } from './deck-share.types';
import { findOwnedDeck, resolveShareTarget } from './decks.helpers';
import type { ShareDeckResult } from './decks.types';

export async function createDeckShare(
  prisma: PrismaService,
  deckId: string,
  identifier: string,
  permission: DeckSharePermission,
  userId: string,
): Promise<ShareDeckResult> {
  const deck = await findOwnedDeck(prisma, deckId, userId);
  if (!deck) {
    return { status: 'not_found' };
  }

  const target = await resolveShareTarget(prisma, identifier);
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

  const existing = await prisma.deckShare.findUnique({
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

  const share = await prisma.deckShare.create({
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

export async function removeDeckShare(
  prisma: PrismaService,
  deckId: string,
  sharedUserId: string,
  userId: string,
): Promise<boolean> {
  const deck = await findOwnedDeck(prisma, deckId, userId);
  if (!deck) {
    return false;
  }

  const result = await prisma.deckShare.deleteMany({
    where: {
      deckId,
      userId: sharedUserId,
    },
  });

  return result.count > 0;
}

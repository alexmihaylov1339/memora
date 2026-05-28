import { PrismaService } from '../../prisma/prisma.service';
import type { DeckExerciseSettings } from './deck-exercise-settings';
import { serializeDeckExerciseSettings } from './deck-exercise-settings';
import type { DeckPresentationMode } from './deck-presentation-mode';
import {
  hasExistingCards,
  hasExistingChunks,
  replaceDeckCards,
  replaceDeckChunks,
  resolveDeckRecord,
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
    presentationMode?: DeckPresentationMode;
    reviewIntervalHours?: number[];
    exerciseSettings?: DeckExerciseSettings;
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
        presentationMode: data.presentationMode,
        reviewIntervalHours: data.reviewIntervalHours,
        exerciseSettings: serializeDeckExerciseSettings(data.exerciseSettings),
      },
      include: {
        owner: {
          select: {
            id: true,
            email: true,
            name: true,
          },
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
    });
    const cardCount = await tx.deckCard.count({ where: { deckId: id } });

    return {
      status: 'updated',
      deck: {
        ...resolveDeckRecord(deck),
        count: cardCount,
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

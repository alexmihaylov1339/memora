import { PrismaService } from '../../prisma/prisma.service';
import {
  moveCardsToDeck,
  moveChunksToDeck,
  hasExistingCards,
  hasExistingChunks,
} from './decks.helpers';
import type { DeckPresentationMode } from './deck-presentation-mode';
import { resolveDeckReviewIntervalHours } from './deck-review-intervals';
import type { CreateDeckResult, DeckRecord } from './decks.types';

export async function createDeck(
  prisma: PrismaService,
  input: {
    name: string;
    description?: string;
    cardIds: string[];
    chunkIds: string[];
    presentationMode: DeckPresentationMode;
    reviewIntervalHours?: number[];
    userId: string;
  },
): Promise<CreateDeckResult> {
  if (
    input.cardIds.length > 0 &&
    !(await hasExistingCards(prisma, input.cardIds, input.userId))
  ) {
    return { status: 'invalid_cards' };
  }

  if (
    input.chunkIds.length > 0 &&
    !(await hasExistingChunks(prisma, input.chunkIds, input.userId))
  ) {
    return { status: 'invalid_chunks' };
  }

  return prisma.$transaction(async (tx) => {
    const deck = (await tx.deck.create({
      data: {
        name: input.name,
        description: input.description,
        presentationMode: input.presentationMode,
        reviewIntervalHours: input.reviewIntervalHours,
        ownerId: input.userId,
      },
    })) as unknown as DeckRecord;

    await moveCardsToDeck(tx, deck.id, input.cardIds);
    await moveChunksToDeck(tx, deck.id, input.chunkIds);

    return {
      status: 'created',
      deck: {
        ...deck,
        reviewIntervalHours: resolveDeckReviewIntervalHours(
          deck.reviewIntervalHours,
        ),
      },
    } satisfies CreateDeckResult;
  });
}

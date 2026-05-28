import { PrismaService } from '../../prisma/prisma.service';
import type { DeckExerciseSettings } from './deck-exercise-settings';
import { serializeDeckExerciseSettings } from './deck-exercise-settings';
import {
  hasExistingCards,
  hasExistingChunks,
  moveCardsToDeck,
  moveChunksToDeck,
  resolveDeckRecord,
} from './decks.helpers';
import type { DeckPresentationMode } from './deck-presentation-mode';
import type { CreateDeckResult } from './decks.types';

export async function createDeck(
  prisma: PrismaService,
  input: {
    name: string;
    description?: string;
    cardIds: string[];
    chunkIds: string[];
    presentationMode: DeckPresentationMode;
    reviewIntervalHours?: number[];
    exerciseSettings?: DeckExerciseSettings;
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
        isPublic: false,
        reviewIntervalHours: input.reviewIntervalHours,
        exerciseSettings: serializeDeckExerciseSettings(input.exerciseSettings),
        ownerId: input.userId,
      },
    })) as Parameters<typeof resolveDeckRecord>[0];

    await moveCardsToDeck(tx, deck.id, input.cardIds);
    await moveChunksToDeck(tx, deck.id, input.chunkIds);

    return {
      status: 'created',
      deck: resolveDeckRecord(deck),
    } satisfies CreateDeckResult;
  });
}

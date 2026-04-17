import { PrismaService } from '../../prisma/prisma.service';
import {
  attachCardsToDeck,
  attachChunksToDeck,
  hasExistingCards,
  hasExistingChunks,
} from './decks.helpers';
import type { CreateDeckResult, DeckRecord } from './decks.types';

export async function createDeck(
  prisma: PrismaService,
  input: {
    name: string;
    description?: string;
    cardIds: string[];
    chunkIds: string[];
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
        ownerId: input.userId,
      },
    })) as DeckRecord;

    await attachCardsToDeck(tx, deck.id, input.cardIds);
    await attachChunksToDeck(tx, deck.id, input.chunkIds);

    return { status: 'created', deck } satisfies CreateDeckResult;
  });
}

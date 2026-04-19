import { PrismaService } from '../../prisma/prisma.service';
import {
  hasExistingCards,
  hasExistingChunks,
  moveCardsToDeck,
  moveChunksToDeck,
} from './decks.helpers';
import { isOwnedDeck } from './deck-membership-access';
import type {
  DetachDeckCardsResult,
  DetachDeckChunksResult,
  MoveDeckCardsResult,
  MoveDeckChunksResult,
} from './decks.types';

export async function moveDeckCards(
  prisma: PrismaService,
  deckId: string,
  cardIds: string[],
  userId: string,
): Promise<MoveDeckCardsResult> {
  if (!(await isOwnedDeck(prisma, deckId, userId))) {
    return { status: 'not_found' };
  }

  if (!(await hasExistingCards(prisma, cardIds, userId))) {
    return { status: 'invalid_cards' };
  }

  await prisma.$transaction(async (tx) => {
    await moveCardsToDeck(tx, deckId, cardIds);
  });

  return {
    status: 'moved',
    result: {
      deckId,
      cardIds,
      count: cardIds.length,
    },
  };
}

export async function moveDeckChunks(
  prisma: PrismaService,
  deckId: string,
  chunkIds: string[],
  userId: string,
): Promise<MoveDeckChunksResult> {
  if (!(await isOwnedDeck(prisma, deckId, userId))) {
    return { status: 'not_found' };
  }

  if (!(await hasExistingChunks(prisma, chunkIds, userId))) {
    return { status: 'invalid_chunks' };
  }

  await prisma.$transaction(async (tx) => {
    await moveChunksToDeck(tx, deckId, chunkIds);
  });

  return {
    status: 'moved',
    result: {
      deckId,
      chunkIds,
      count: chunkIds.length,
    },
  };
}

export async function detachDeckCards(
  prisma: PrismaService,
  deckId: string,
  cardIds: string[],
  userId: string,
): Promise<DetachDeckCardsResult> {
  if (!(await isOwnedDeck(prisma, deckId, userId))) {
    return { status: 'not_found' };
  }

  const cardsInDeck = await prisma.card.findMany({
    where: { id: { in: cardIds }, deckId, deck: { ownerId: userId } },
    select: { id: true },
  });

  if (cardsInDeck.length !== cardIds.length) {
    return { status: 'invalid_cards' };
  }

  await prisma.card.deleteMany({
    where: { id: { in: cardIds }, deckId },
  });

  return {
    status: 'detached',
    result: {
      deckId,
      cardIds,
      count: cardIds.length,
    },
  };
}

export async function detachDeckChunks(
  prisma: PrismaService,
  deckId: string,
  chunkIds: string[],
  userId: string,
): Promise<DetachDeckChunksResult> {
  if (!(await isOwnedDeck(prisma, deckId, userId))) {
    return { status: 'not_found' };
  }

  const chunksInDeck = await prisma.chunk.findMany({
    where: { id: { in: chunkIds }, deckId, deck: { ownerId: userId } },
    select: { id: true },
  });

  if (chunksInDeck.length !== chunkIds.length) {
    return { status: 'invalid_chunks' };
  }

  await prisma.chunk.deleteMany({
    where: { id: { in: chunkIds }, deckId },
  });

  return {
    status: 'detached',
    result: {
      deckId,
      chunkIds,
      count: chunkIds.length,
    },
  };
}

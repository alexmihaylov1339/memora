import type { PrismaService } from '../../prisma/prisma.service';

type DeckInboxPersistenceClient = Pick<
  PrismaService,
  'card' | 'chunk' | 'chunkReviewState'
>;

const DECK_INBOX_CHUNK_TITLE = 'Deck Inbox';

function getImmediateDueAt(): Date {
  return new Date();
}

async function makeInboxChunkDueNow(
  client: DeckInboxPersistenceClient,
  chunkId: string,
): Promise<void> {
  const due = getImmediateDueAt();

  await client.chunkReviewState.upsert({
    where: { chunkId },
    update: {
      due,
      consecutiveSuccessCount: 0,
      lastGrade: null,
    },
    create: {
      chunkId,
      due,
      consecutiveSuccessCount: 0,
      lastGrade: null,
    },
  });
}

export async function ensureDeckInboxMembership(
  client: DeckInboxPersistenceClient,
  deckId: string,
  cardIds: string[],
  ownerId?: string,
): Promise<void> {
  const cardsWithoutChunkInDeck = await client.card.findMany({
    where: {
      id: { in: cardIds },
      deckId,
      chunkCards: {
        none: {
          chunk: {
            deckId,
          },
        },
      },
    },
    select: { id: true },
    orderBy: { createdAt: 'asc' },
  });

  if (cardsWithoutChunkInDeck.length === 0) {
    return;
  }

  const inboxChunk = await client.chunk.findFirst({
    where: { deckId, title: DECK_INBOX_CHUNK_TITLE },
    include: {
      chunkCards: {
        select: { sequenceIndex: true },
        orderBy: { sequenceIndex: 'desc' },
        take: 1,
      },
    },
  });

  if (!inboxChunk) {
    const createdInboxChunk = await client.chunk.create({
      data: {
        ownerId: ownerId ?? null,
        deckId,
        title: DECK_INBOX_CHUNK_TITLE,
        position: 0,
        chunkCards: {
          create: cardsWithoutChunkInDeck.map((card, index) => ({
            cardId: card.id,
            sequenceIndex: index,
          })),
        },
      },
      select: {
        id: true,
      },
    });

    await makeInboxChunkDueNow(client, createdInboxChunk.id);
    return;
  }

  const lastSequenceIndex = inboxChunk.chunkCards[0]?.sequenceIndex ?? -1;
  await client.chunk.update({
    where: { id: inboxChunk.id },
    data: {
      chunkCards: {
        create: cardsWithoutChunkInDeck.map((card, index) => ({
          cardId: card.id,
          sequenceIndex: lastSequenceIndex + index + 1,
        })),
      },
    },
  });

  await makeInboxChunkDueNow(client, inboxChunk.id);
}

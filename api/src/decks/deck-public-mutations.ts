import { PrismaService } from '../../prisma/prisma.service';
import { resetChunkReviewProgress } from '../chunks/chunks.helpers';
import { initStandaloneCardReviewState } from '../reviews/standalone-card-review';
import { findOwnedDeck, resolveDeckRecord } from './decks.helpers';
import type {
  CopyPublicDeckResult,
  UpdateDeckPublicationResult,
} from './decks.types';

interface SourceDeckCard {
  id: string;
  kind: string;
  fields: unknown;
}

interface SourceChunkCard {
  cardId: string;
  sequenceIndex: number;
  offsetDays: number | null;
  card: SourceDeckCard;
}

interface SourceDeckChunk {
  id: string;
  title: string;
  position: number;
  chunkCards: SourceChunkCard[];
}

interface SourcePublicDeck {
  id: string;
  name: string;
  description: string | null;
  presentationMode: string;
  isPublic: boolean;
  reviewIntervalHours: unknown;
  exerciseSettings: unknown;
  deckCards: Array<{
    cardId: string;
    card: SourceDeckCard;
  }>;
  chunks: SourceDeckChunk[];
}

export async function updateDeckPublication(
  prisma: PrismaService,
  deckId: string,
  isPublic: boolean,
  userId: string,
): Promise<UpdateDeckPublicationResult> {
  const deck = await findOwnedDeck(prisma, deckId, userId);
  if (!deck) {
    return { status: 'not_found' };
  }

  const updatedDeck = await prisma.deck.update({
    where: { id: deckId },
    data: { isPublic },
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
  const count = await prisma.deckCard.count({ where: { deckId } });

  return {
    status: 'updated',
    deck: {
      ...resolveDeckRecord(updatedDeck),
      count,
      sharedUsers: updatedDeck.shares.map((share) => ({
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
  };
}

export async function copyPublicDeck(
  prisma: PrismaService,
  deckId: string,
  userId: string,
  now = new Date(),
): Promise<CopyPublicDeckResult> {
  const sourceDeck = (await prisma.deck.findFirst({
    where: { id: deckId, isPublic: true },
    include: {
      deckCards: {
        orderBy: [{ createdAt: 'asc' }, { cardId: 'asc' }],
        include: {
          card: {
            select: {
              id: true,
              kind: true,
              fields: true,
            },
          },
        },
      },
      chunks: {
        orderBy: [{ position: 'asc' }, { id: 'asc' }],
        include: {
          chunkCards: {
            orderBy: [{ sequenceIndex: 'asc' }, { cardId: 'asc' }],
            include: {
              card: {
                select: {
                  id: true,
                  kind: true,
                  fields: true,
                },
              },
            },
          },
        },
      },
    },
  })) as SourcePublicDeck | null;

  if (!sourceDeck) {
    return { status: 'not_found' };
  }

  return prisma.$transaction(async (transactionClient) => {
    const copiedDeck = await transactionClient.deck.create({
      data: {
        ownerId: userId,
        name: sourceDeck.name,
        description: sourceDeck.description,
        presentationMode: sourceDeck.presentationMode,
        isPublic: false,
        reviewIntervalHours: sourceDeck.reviewIntervalHours as never,
        exerciseSettings: sourceDeck.exerciseSettings as never,
      },
    });

    const sourceCards = collectSourceCards(sourceDeck);
    const cardIdMap = new Map<string, string>();
    const copiedCardIds: string[] = [];

    for (const sourceCard of sourceCards) {
      const copiedCard = await transactionClient.card.create({
        data: {
          ownerId: userId,
          deckId: copiedDeck.id,
          kind: sourceCard.kind,
          fields: sourceCard.fields as never,
        },
      });

      cardIdMap.set(sourceCard.id, copiedCard.id);
      copiedCardIds.push(copiedCard.id);
    }

    await transactionClient.deckCard.createMany({
      data: copiedCardIds.map((cardId) => ({
        deckId: copiedDeck.id,
        cardId,
      })),
      skipDuplicates: true,
    });
    await initStandaloneCardReviewState(transactionClient, copiedCardIds, now);

    for (const sourceChunk of sourceDeck.chunks) {
      const copiedChunk = await transactionClient.chunk.create({
        data: {
          ownerId: userId,
          deckId: copiedDeck.id,
          title: sourceChunk.title,
          position: sourceChunk.position,
        },
      });

      const copiedChunkCards = sourceChunk.chunkCards
        .map((chunkCard) => {
          const copiedCardId = cardIdMap.get(chunkCard.cardId);
          if (!copiedCardId) {
            return null;
          }

          return {
            chunkId: copiedChunk.id,
            cardId: copiedCardId,
            sequenceIndex: chunkCard.sequenceIndex,
            offsetDays: chunkCard.offsetDays,
          };
        })
        .filter((chunkCard) => chunkCard !== null);

      if (copiedChunkCards.length > 0) {
        await transactionClient.chunkCard.createMany({
          data: copiedChunkCards,
        });
      }

      await resetChunkReviewProgress(transactionClient, copiedChunk.id, now);
    }

    return {
      status: 'copied',
      deck: resolveDeckRecord(copiedDeck),
    } satisfies CopyPublicDeckResult;
  });
}

function collectSourceCards(sourceDeck: SourcePublicDeck): SourceDeckCard[] {
  const sourceCardsById = new Map<string, SourceDeckCard>();

  for (const deckCard of sourceDeck.deckCards) {
    sourceCardsById.set(deckCard.cardId, deckCard.card);
  }

  for (const chunk of sourceDeck.chunks) {
    for (const chunkCard of chunk.chunkCards) {
      sourceCardsById.set(chunkCard.cardId, chunkCard.card);
    }
  }

  return Array.from(sourceCardsById.values());
}

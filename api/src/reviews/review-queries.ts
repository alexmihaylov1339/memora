import { PrismaService } from '../../prisma/prisma.service';
import type { CardAssetsService } from '../cards/card-assets.service';
import {
  deriveChunkReviewState,
  type ChunkProgressSnapshot,
} from './chunk-progress';
import {
  findAccessibleDeckIds,
  findChunkWithCards,
  findChunksWithReviewState,
} from './review-access';
import {
  buildPracticeItems,
  type StandalonePracticeCard,
} from './review-practice';
import {
  buildEligibleQueueItems,
  buildFullQueueItems,
  buildStandaloneCardQueueItems,
  type PracticeItem,
  type ReviewQueueItem,
  type StandaloneCardQueueRecord,
} from './review-queue';
import { ensureChunkReviewState } from './review-grade';

export type { ChunkProgressSnapshot } from './chunk-progress';
export type { PracticeItem, ReviewQueueItem } from './review-queue';

export async function getChunkProgress(
  prisma: PrismaService,
  chunkId: string,
  now = new Date(),
): Promise<ChunkProgressSnapshot | null> {
  const chunk = await findChunkWithCards(prisma, chunkId);

  if (!chunk) {
    return null;
  }

  const state = await ensureChunkReviewState(prisma, chunkId, now);
  return deriveChunkReviewState(chunk, now, state);
}

export async function getEligibleQueueItems(
  prisma: PrismaService,
  userId: string,
  now = new Date(),
  deckId?: string,
): Promise<ReviewQueueItem[]> {
  const [chunks, standaloneCards] = await Promise.all([
    findChunksWithReviewState(prisma, userId, deckId),
    getStandaloneCardQueueItems(prisma, userId, now, deckId),
  ]);

  return buildFullQueueItems(
    buildEligibleQueueItems(chunks, now),
    buildStandaloneCardQueueItems(standaloneCards),
  );
}

export async function getStandaloneCardQueueItems(
  prisma: PrismaService,
  userId: string,
  now = new Date(),
  deckId?: string,
): Promise<StandaloneCardQueueRecord[]> {
  const deckIds = await findAccessibleDeckIds(prisma, userId);
  const scopedDeckIds = deckId
    ? deckIds.filter((id) => id === deckId)
    : deckIds;

  if (scopedDeckIds.length === 0) {
    return [];
  }

  const memberships = await prisma.deckCard.findMany({
    where: {
      deckId: { in: scopedDeckIds },
      card: {
        chunkCards: {
          none: {
            chunk: {
              deckId: { in: scopedDeckIds },
            },
          },
        },
        state: {
          is: {
            due: { lte: now },
          },
        },
      },
    },
    orderBy: [{ createdAt: 'asc' }, { cardId: 'asc' }],
    select: {
      deckId: true,
      card: {
        select: {
          id: true,
          kind: true,
          fields: true,
          createdAt: true,
          state: {
            select: {
              due: true,
              consecutiveSuccessCount: true,
              lastGrade: true,
            },
          },
        },
      },
    },
  });

  return memberships.map((membership) => ({
    id: membership.card.id,
    deckId: membership.deckId,
    kind: membership.card.kind,
    fields: membership.card.fields,
    createdAt: membership.card.createdAt,
    state: membership.card.state,
  })) as StandaloneCardQueueRecord[];
}

export async function getPracticeItems(
  prisma: PrismaService,
  userId: string,
  deckId: string,
  cardAssets?: CardAssetsService,
): Promise<PracticeItem[]> {
  const [chunks, standaloneCards] = await Promise.all([
    findChunksWithReviewState(prisma, userId, deckId),
    getStandalonePracticeCards(prisma, userId, deckId),
  ]);

  const items = buildPracticeItems(chunks, standaloneCards);
  if (!cardAssets) {
    return items;
  }

  return Promise.all(
    items.map(async (item) => ({
      ...item,
      fields: await cardAssets.resolveCardFields(item.kind, item.fields),
    })),
  );
}

async function getStandalonePracticeCards(
  prisma: PrismaService,
  userId: string,
  deckId: string,
): Promise<StandalonePracticeCard[]> {
  const deckIds = await findAccessibleDeckIds(prisma, userId);
  if (!deckIds.includes(deckId)) {
    return [];
  }

  const memberships = await prisma.deckCard.findMany({
    where: { deckId },
    orderBy: [{ createdAt: 'asc' }, { cardId: 'asc' }],
    select: {
      deckId: true,
      createdAt: true,
      card: {
        select: {
          id: true,
          kind: true,
          fields: true,
          createdAt: true,
        },
      },
    },
  });

  return memberships.map((membership) => ({
    id: membership.card.id,
    deckId: membership.deckId,
    kind: membership.card.kind,
    fields: membership.card.fields,
    createdAt: membership.card.createdAt,
    deckCardCreatedAt: membership.createdAt,
  })) as StandalonePracticeCard[];
}

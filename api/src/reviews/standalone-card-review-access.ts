import type { PrismaService } from '../../prisma/prisma.service';
import { getAccessibleDeckIds } from '../decks/deck-access';
import type { StandaloneReviewCard } from './standalone-card-review-types';

export async function findReviewableStandaloneCard(
  prisma: PrismaService,
  cardId: string,
  userId: string,
  deckId?: string,
): Promise<StandaloneReviewCard | null> {
  const accessibleDeckIds = await getAccessibleDeckIds(prisma, userId);
  const scopedDeckIds = deckId
    ? accessibleDeckIds.filter((id) => id === deckId)
    : accessibleDeckIds;

  if (scopedDeckIds.length === 0) {
    return null;
  }

  return (await prisma.card.findFirst({
    where: {
      id: cardId,
      deckId: { in: scopedDeckIds },
      chunkCards: {
        none: {
          chunk: {
            deckId: { in: scopedDeckIds },
          },
        },
      },
    },
    select: {
      id: true,
      deckId: true,
      kind: true,
      fields: true,
      createdAt: true,
      deck: {
        select: { reviewIntervalHours: true },
      },
      state: {
        select: {
          due: true,
          ease: true,
          interval: true,
          reps: true,
          lapses: true,
          consecutiveSuccessCount: true,
          lastGrade: true,
        },
      },
    },
  })) as StandaloneReviewCard | null;
}

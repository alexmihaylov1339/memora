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

  const membership = await prisma.deckCard.findFirst({
    where: {
      deckId: { in: scopedDeckIds },
      cardId,
      card: {
        chunkCards: {
          none: {
            chunk: {
              deckId: { in: scopedDeckIds },
            },
          },
        },
      },
    },
    select: {
      deckId: true,
      deck: {
        select: { reviewIntervalHours: true },
      },
      card: {
        select: {
          id: true,
          kind: true,
          fields: true,
          createdAt: true,
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
      },
    },
  });

  if (!membership) {
    return null;
  }

  return {
    id: membership.card.id,
    deckId: membership.deckId,
    kind: membership.card.kind,
    fields: membership.card.fields,
    createdAt: membership.card.createdAt,
    deck: membership.deck,
    state: membership.card.state,
  } as StandaloneReviewCard;
}

import type { PrismaService } from '../../prisma/prisma.service';
import { parseStoredImageAudioCardFields } from '../cards/image-audio-card-kind';

export const WHAT_DID_YOU_HEAR_MINIMUM_ELIGIBLE_CARDS = 2;

interface DeckQuizMembership {
  deckId: string;
  card: {
    id: string;
    kind: string;
    fields: unknown;
  };
}

type DeckQuizEligibilityClient = Pick<PrismaService, 'deckCard'>;

export interface DeckQuizEligibility {
  isWhatDidYouHearEligible: boolean;
  whatDidYouHearEligibleCardCount: number;
}

export function resolveDeckQuizEligibility(
  eligibleCardCount: number,
): DeckQuizEligibility {
  return {
    isWhatDidYouHearEligible:
      eligibleCardCount >= WHAT_DID_YOU_HEAR_MINIMUM_ELIGIBLE_CARDS,
    whatDidYouHearEligibleCardCount: eligibleCardCount,
  };
}

export async function getWhatDidYouHearEligibleCardCounts(
  prisma: DeckQuizEligibilityClient,
  deckIds: string[],
): Promise<Map<string, number>> {
  if (deckIds.length === 0) {
    return new Map();
  }

  const memberships = ((await prisma.deckCard.findMany({
    where: {
      deckId: { in: deckIds },
      card: {
        kind: 'image_audio',
      },
    },
    select: {
      deckId: true,
      card: {
        select: {
          id: true,
          kind: true,
          fields: true,
        },
      },
    },
  })) ?? []) as DeckQuizMembership[];

  return memberships.reduce((counts, membership) => {
    if (
      membership.card.kind === 'image_audio' &&
      parseStoredImageAudioCardFields(membership.card.fields)
    ) {
      counts.set(membership.deckId, (counts.get(membership.deckId) ?? 0) + 1);
    }

    return counts;
  }, new Map<string, number>());
}

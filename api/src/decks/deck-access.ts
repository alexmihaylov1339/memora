import { PrismaService } from '../../prisma/prisma.service';

export async function getAccessibleDeckIds(
  prisma: PrismaService,
  userId: string,
): Promise<string[]> {
  const [ownedDecks, sharedDecks] = await Promise.all([
    prisma.deck.findMany({
      where: { ownerId: userId },
      select: { id: true },
    }),
    prisma.deckShare.findMany({
      where: { userId },
      select: { deckId: true },
    }),
  ]);

  return Array.from(
    new Set([
      ...ownedDecks.map((deck) => deck.id),
      ...sharedDecks.map((share) => share.deckId),
    ]),
  );
}

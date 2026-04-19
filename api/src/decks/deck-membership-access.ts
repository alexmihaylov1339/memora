import { PrismaService } from '../../prisma/prisma.service';

export async function isOwnedDeck(
  prisma: PrismaService,
  deckId: string,
  userId: string,
): Promise<boolean> {
  const deck = await prisma.deck.findFirst({
    where: { id: deckId, ownerId: userId },
    select: { id: true },
  });

  return Boolean(deck);
}

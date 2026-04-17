import { PrismaService } from '../../prisma/prisma.service';
import { findOwnedDeck } from './decks.helpers';

export async function removeDeck(
  prisma: PrismaService,
  id: string,
  userId: string,
): Promise<boolean> {
  const existing = await findOwnedDeck(prisma, id, userId);
  if (!existing) {
    return false;
  }

  await prisma.deck.delete({ where: { id } });
  return true;
}

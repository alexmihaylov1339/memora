import type { Deck } from '../types';

type DeckListItemResponse = Omit<Deck, 'dueCount'> & {
  dueCount?: number | null;
};

export function mapDeckListResponse(decks: DeckListItemResponse[]): Deck[] {
  return decks.map((deck) => ({
    ...deck,
    dueCount: deck.dueCount ?? 0,
  }));
}

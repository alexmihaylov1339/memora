import type { Deck } from '../types';
import type { DeckPresentationMode } from '../constants';

interface DeckListItemResponse {
  id: string;
  name: string;
  count: number;
  dueCount?: number | null;
  presentationMode?: DeckPresentationMode | null;
  isPublic?: boolean | null;
}

export function mapDeckListResponse(decks: DeckListItemResponse[]): Deck[] {
  return decks.map((deck) => ({
    ...deck,
    dueCount: deck.dueCount ?? 0,
    presentationMode: deck.presentationMode ?? 'standard',
    isPublic: deck.isPublic ?? false,
  }));
}

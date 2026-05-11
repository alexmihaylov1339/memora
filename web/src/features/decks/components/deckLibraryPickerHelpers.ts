import type { SearchResultItem } from '@features/search';

import type { Deck } from '../types';

export interface DeckLibraryRow extends SearchResultItem {
  selected: boolean;
  cardCount: string;
}

export function mapDeckToSearchResult(deck: Deck): SearchResultItem {
  return {
    id: deck.id,
    type: 'deck',
    label: deck.name,
    description: `${deck.count} card${deck.count === 1 ? '' : 's'}`,
  };
}

export function mapDeckToLibraryRow(
  deck: Deck,
  selectedIds: Set<string>,
): DeckLibraryRow {
  return {
    ...mapDeckToSearchResult(deck),
    selected: selectedIds.has(deck.id),
    cardCount: `${deck.count}`,
  };
}

export function filterDeckLibraryRows(
  rows: DeckLibraryRow[],
  searchText: string,
): DeckLibraryRow[] {
  const normalizedSearchText = searchText.trim().toLowerCase();

  if (!normalizedSearchText) {
    return rows;
  }

  return rows.filter((row) =>
    [row.label, row.description, row.cardCount]
      .filter(Boolean)
      .join(' ')
      .toLowerCase()
      .includes(normalizedSearchText),
  );
}

export function mergeDeckSearchResultItems(
  currentItems: SearchResultItem[],
  incomingItems: SearchResultItem[],
): SearchResultItem[] {
  const existingIds = new Set(currentItems.map((item) => item.id));
  const nextItems = [...currentItems];

  incomingItems.forEach((item) => {
    if (!existingIds.has(item.id)) {
      existingIds.add(item.id);
      nextItems.push(item);
    }
  });

  return nextItems;
}

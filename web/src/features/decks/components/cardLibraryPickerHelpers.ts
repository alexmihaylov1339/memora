import type { SearchResultItem } from '@features/search';

import { getCardPreview } from '../card-kinds';
import type { CardRecord } from '../types';

export interface CardLibraryRow extends SearchResultItem {
  selected: boolean;
  deckStatus: string;
}

export function mapCardToSearchResult(card: CardRecord): SearchResultItem {
  const preview = getCardPreview(card);

  return {
    id: card.id,
    type: 'card',
    label: preview.front,
    description: preview.back,
  };
}

export function mapCardToLibraryRow(
  card: CardRecord,
  selectedIds: Set<string>,
  formatDeckStatus: (deckCount: number) => string,
): CardLibraryRow {
  const deckCount = card.deckIds?.length ?? (card.deckId ? 1 : 0);

  return {
    ...mapCardToSearchResult(card),
    selected: selectedIds.has(card.id),
    deckStatus: formatDeckStatus(deckCount),
  };
}

export function filterCardLibraryRows(
  rows: CardLibraryRow[],
  searchText: string,
): CardLibraryRow[] {
  const normalizedSearchText = searchText.trim().toLowerCase();

  if (!normalizedSearchText) {
    return rows;
  }

  return rows.filter((row) =>
    [row.label, row.description, row.deckStatus]
      .filter(Boolean)
      .join(' ')
      .toLowerCase()
      .includes(normalizedSearchText),
  );
}

export function mergeSearchResultItems(
  currentItems: SearchResultItem[],
  incomingItems: SearchResultItem[],
): SearchResultItem[] {
  const existingKeys = new Set(
    currentItems.map((item) => `${item.type}:${item.id}`),
  );
  const nextItems = [...currentItems];

  incomingItems.forEach((item) => {
    const key = `${item.type}:${item.id}`;

    if (!existingKeys.has(key)) {
      existingKeys.add(key);
      nextItems.push(item);
    }
  });

  return nextItems;
}

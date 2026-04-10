'use client';

import { EntitySearch } from '@shared/components';
import { SEARCH_QUERY_KEYS, type SearchResultItem } from '@features/search';
import { cardService } from '../services';

interface DeckCardMultiSelectProps {
  selectedItems: SearchResultItem[];
  onSelectionChange: (items: SearchResultItem[]) => void;
}

export default function DeckCardMultiSelect({
  selectedItems,
  onSelectionChange,
}: DeckCardMultiSelectProps) {
  return (
    <div>
      <p>Add cards to this deck</p>
      <EntitySearch
        queryKey={SEARCH_QUERY_KEYS.card}
        search={cardService.search}
        selectionMode="multiple"
        selectedItems={selectedItems}
        onSelectionChange={onSelectionChange}
        placeholder="Search cards to add"
      />
    </div>
  );
}

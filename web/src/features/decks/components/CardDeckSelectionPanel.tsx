import { useState } from 'react';

import { EntitySearch, Grid, type GridColumnDef } from '@shared/components';
import {
  SEARCH_QUERY_KEYS,
  SEARCH_SELECTION_MODES,
  type SearchResultItem,
} from '@features/search';

import { deckService } from '../services';
import DeckLibraryPicker from './DeckLibraryPicker';
import { mergeDeckSearchResultItems } from './deckLibraryPickerHelpers';

interface CardDeckSelectionPanelProps {
  selectedDecks: SearchResultItem[];
  onSelectionChange: (items: SearchResultItem[]) => void;
}

const deckColumnDefs: GridColumnDef<SearchResultItem>[] = [
  { field: 'label', headerName: 'Deck' },
  { field: 'description', headerName: 'Cards' },
];

export default function CardDeckSelectionPanel({
  selectedDecks,
  onSelectionChange,
}: CardDeckSelectionPanelProps) {
  const [isDeckLibraryOpen, setIsDeckLibraryOpen] = useState(false);

  function handleRemove(item: SearchResultItem) {
    onSelectionChange(selectedDecks.filter((deck) => deck.id !== item.id));
  }

  function handleConfirmBrowseSelection(items: SearchResultItem[]) {
    onSelectionChange(mergeDeckSearchResultItems(selectedDecks, items));
    setIsDeckLibraryOpen(false);
  }

  return (
    <section className="space-y-3 rounded-[5px] border border-line-soft bg-white p-4">
      <div>
        <h3 className="text-base font-semibold text-ink-heading">Decks</h3>
        <p className="mt-1 text-sm text-ink-muted">
          Attach this card to one or more decks.
        </p>
      </div>

      <EntitySearch
        queryKey={SEARCH_QUERY_KEYS.deck}
        search={deckService.search}
        selectionMode={SEARCH_SELECTION_MODES.multiple}
        selectedItems={selectedDecks}
        onSelectionChange={onSelectionChange}
        placeholder="Search decks"
      />

      <button
        type="button"
        onClick={() => setIsDeckLibraryOpen(true)}
        className="cursor-pointer rounded-[5px] border border-line px-4 py-2 text-sm font-semibold text-ink-heading transition hover:bg-surface-soft"
      >
        Browse decks
      </button>

      <Grid
        id="card-selected-decks-grid"
        rowData={selectedDecks}
        columnDefs={deckColumnDefs}
        emptyMessage="This card is not attached to any decks yet."
        showQuickFilter={false}
        onRemove={handleRemove}
        paginate
        pageSize={5}
      />

      {isDeckLibraryOpen && (
        <DeckLibraryPicker
          isOpen={isDeckLibraryOpen}
          selectedDecks={selectedDecks}
          onCancel={() => setIsDeckLibraryOpen(false)}
          onConfirm={handleConfirmBrowseSelection}
        />
      )}
    </section>
  );
}

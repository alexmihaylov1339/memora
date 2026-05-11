import { useState } from 'react';
import { useTranslations } from 'next-intl';

import { EntitySearch, Grid, type GridColumnDef } from '@shared/components';
import { TRANSLATION_KEYS } from '@/i18n';
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

export default function CardDeckSelectionPanel({
  selectedDecks,
  onSelectionChange,
}: CardDeckSelectionPanelProps) {
  const t = useTranslations();
  const [isDeckLibraryOpen, setIsDeckLibraryOpen] = useState(false);
  const deckColumnDefs: GridColumnDef<SearchResultItem>[] = [
    { field: 'label', headerName: t(TRANSLATION_KEYS.cards.deckColumn) },
    { field: 'description', headerName: t(TRANSLATION_KEYS.decks.cardsCount) },
  ];

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
        <h3 className="text-base font-semibold text-ink-heading">
          {t(TRANSLATION_KEYS.cards.decksSectionTitle)}
        </h3>
        <p className="mt-1 text-sm text-ink-muted">
          {t(TRANSLATION_KEYS.cards.attachDecksDescription)}
        </p>
      </div>

      <EntitySearch
        queryKey={SEARCH_QUERY_KEYS.deck}
        search={deckService.search}
        selectionMode={SEARCH_SELECTION_MODES.multiple}
        selectedItems={selectedDecks}
        onSelectionChange={onSelectionChange}
        placeholder={t(TRANSLATION_KEYS.cards.searchDecks)}
      />

      <button
        type="button"
        onClick={() => setIsDeckLibraryOpen(true)}
        className="cursor-pointer rounded-[5px] border border-line px-4 py-2 text-sm font-semibold text-ink-heading transition hover:bg-surface-soft"
      >
        {t(TRANSLATION_KEYS.cards.browseDecks)}
      </button>

      <Grid
        id="card-selected-decks-grid"
        rowData={selectedDecks}
        columnDefs={deckColumnDefs}
        emptyMessage={t(TRANSLATION_KEYS.cards.emptySelectedDecks)}
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

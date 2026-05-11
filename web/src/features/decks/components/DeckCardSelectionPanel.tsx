import { useState } from 'react';

import { EntitySearch } from '@shared/components';
import {
  SEARCH_QUERY_KEYS,
  SEARCH_SELECTION_MODES,
  type SearchResultItem,
} from '@features/search';

import { DECK_SELECTED_ITEMS_PAGE_SIZE } from '../constants';
import { cardService } from '../services';
import CardLibraryPicker from './CardLibraryPicker';
import DeckSelectedItemsGrid from './DeckSelectedItemsGrid';
import { mergeSearchResultItems } from './cardLibraryPickerHelpers';
import styles from './CreateDeckForm.module.scss';

interface DeckCardSelectionPanelProps {
  selectedCards: SearchResultItem[];
  onSelectionChange: (items: SearchResultItem[]) => void;
}

export default function DeckCardSelectionPanel({
  selectedCards,
  onSelectionChange,
}: DeckCardSelectionPanelProps) {
  const [isCardLibraryOpen, setIsCardLibraryOpen] = useState(false);

  function handleRemove(item: SearchResultItem) {
    onSelectionChange(
      selectedCards.filter(
        (card) => !(card.id === item.id && card.type === item.type),
      ),
    );
  }

  function handleConfirmBrowseSelection(items: SearchResultItem[]) {
    onSelectionChange(mergeSearchResultItems(selectedCards, items));
    setIsCardLibraryOpen(false);
  }

  return (
    <section className={styles.section}>
      <div className={styles.sectionHeader}>
        <h3 className={styles.sectionTitle}>My Cards</h3>
        <p className={styles.sectionDescription}>Search and select cards for this deck.</p>
      </div>

      <EntitySearch
        queryKey={SEARCH_QUERY_KEYS.card}
        search={cardService.search}
        selectionMode={SEARCH_SELECTION_MODES.multiple}
        selectedItems={selectedCards}
        onSelectionChange={onSelectionChange}
        placeholder="Search cards"
      />

      <div className="mt-3">
        <button
          type="button"
          onClick={() => setIsCardLibraryOpen(true)}
          className="cursor-pointer rounded-[5px] border border-line px-4 py-2 text-sm font-semibold text-ink-heading transition hover:bg-surface-soft"
        >
          Browse cards
        </button>
      </div>

      <div className="mt-2">
        <DeckSelectedItemsGrid
          id="deck-selected-cards-grid"
          items={selectedCards}
          labelHeader="Front"
          descriptionHeader="Back"
          emptyMessage="There are currently no cards to choose from."
          onRemove={handleRemove}
          paginate
          pageSize={DECK_SELECTED_ITEMS_PAGE_SIZE}
        />
      </div>

      {isCardLibraryOpen && (
        <CardLibraryPicker
          isOpen={isCardLibraryOpen}
          selectedCards={selectedCards}
          onCancel={() => setIsCardLibraryOpen(false)}
          onConfirm={handleConfirmBrowseSelection}
        />
      )}
    </section>
  );
}

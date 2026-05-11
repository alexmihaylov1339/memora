import { useState } from 'react';
import { useTranslations } from 'next-intl';

import { EntitySearch } from '@shared/components';
import { TRANSLATION_KEYS } from '@/i18n';
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
  const t = useTranslations();
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
        <h3 className={styles.sectionTitle}>
          {t(TRANSLATION_KEYS.cards.myCards)}
        </h3>
        <p className={styles.sectionDescription}>
          {t(TRANSLATION_KEYS.cards.searchSelectCardsDescription)}
        </p>
      </div>

      <EntitySearch
        queryKey={SEARCH_QUERY_KEYS.card}
        search={cardService.search}
        selectionMode={SEARCH_SELECTION_MODES.multiple}
        selectedItems={selectedCards}
        onSelectionChange={onSelectionChange}
        placeholder={t(TRANSLATION_KEYS.cards.searchCards)}
      />

      <div className="mt-3">
        <button
          type="button"
          onClick={() => setIsCardLibraryOpen(true)}
          className="cursor-pointer rounded-[5px] border border-line px-4 py-2 text-sm font-semibold text-ink-heading transition hover:bg-surface-soft"
        >
          {t(TRANSLATION_KEYS.cards.browseCards)}
        </button>
      </div>

      <div className="mt-2">
        <DeckSelectedItemsGrid
          id="deck-selected-cards-grid"
          items={selectedCards}
          labelHeader={t(TRANSLATION_KEYS.cards.front)}
          descriptionHeader={t(TRANSLATION_KEYS.cards.back)}
          emptyMessage={t(TRANSLATION_KEYS.cards.emptySelectedCards)}
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

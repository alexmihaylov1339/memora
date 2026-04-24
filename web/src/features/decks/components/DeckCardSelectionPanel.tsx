import { EntitySearch } from '@shared/components';
import { SEARCH_QUERY_KEYS, SEARCH_SELECTION_MODES, type SearchResultItem } from '@features/search';
import { cardService } from '../services';
import DeckSelectedItemsGrid from './DeckSelectedItemsGrid';
import styles from './CreateDeckForm.module.scss';

interface DeckCardSelectionPanelProps {
  selectedCards: SearchResultItem[];
  onSelectionChange: (items: SearchResultItem[]) => void;
}

export default function DeckCardSelectionPanel({
  selectedCards,
  onSelectionChange,
}: DeckCardSelectionPanelProps) {
  function handleRemove(item: SearchResultItem) {
    onSelectionChange(selectedCards.filter((c) => !(c.id === item.id && c.type === item.type)));
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

      <div className="mt-2">
        <DeckSelectedItemsGrid
          id="deck-selected-cards-grid"
          items={selectedCards}
          labelHeader="Front"
          descriptionHeader="Back"
          emptyMessage="There are currently no cards to choose from."
          onRemove={handleRemove}
        />
      </div>
    </section>
  );
}

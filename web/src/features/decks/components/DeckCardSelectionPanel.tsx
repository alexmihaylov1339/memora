import { EntitySearch } from '@shared/components';
import { SEARCH_QUERY_KEYS, SEARCH_SELECTION_MODES, type SearchResultItem } from '@features/search';
import { cardService } from '../services';
import DeckSelectedItemsGrid from './DeckSelectedItemsGrid';

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
    <section>
      <div>
        <h3>Cards</h3>
        <p>Search for cards to add to this deck.</p>
      </div>

      <EntitySearch
        queryKey={SEARCH_QUERY_KEYS.card}
        search={cardService.search}
        selectionMode={SEARCH_SELECTION_MODES.multiple}
        selectedItems={selectedCards}
        onSelectionChange={onSelectionChange}
        placeholder="Search cards to add"
      />

      <DeckSelectedItemsGrid
        id="deck-selected-cards-grid"
        items={selectedCards}
        labelHeader="Front"
        descriptionHeader="Back"
        emptyMessage="No cards selected yet."
        onRemove={handleRemove}
      />
    </section>
  );
}

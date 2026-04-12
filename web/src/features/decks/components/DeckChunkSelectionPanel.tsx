import { EntitySearch } from '@shared/components';
import { SEARCH_QUERY_KEYS, SEARCH_SELECTION_MODES, type SearchResultItem } from '@features/search';
import { chunkService } from '@features/chunks';
import DeckSelectedItemsGrid from './DeckSelectedItemsGrid';

interface DeckChunkSelectionPanelProps {
  selectedChunks: SearchResultItem[];
  onSelectionChange: (items: SearchResultItem[]) => void;
}

export default function DeckChunkSelectionPanel({
  selectedChunks,
  onSelectionChange,
}: DeckChunkSelectionPanelProps) {
  function handleRemove(item: SearchResultItem) {
    onSelectionChange(selectedChunks.filter((c) => !(c.id === item.id && c.type === item.type)));
  }

  return (
    <section>
      <div>
        <h3>Chunks</h3>
        <p>Search for chunks to add to this deck.</p>
      </div>

      <EntitySearch
        queryKey={SEARCH_QUERY_KEYS.chunk}
        search={chunkService.search}
        selectionMode={SEARCH_SELECTION_MODES.multiple}
        selectedItems={selectedChunks}
        onSelectionChange={onSelectionChange}
        placeholder="Search chunks to add"
      />

      <DeckSelectedItemsGrid
        id="deck-selected-chunks-grid"
        items={selectedChunks}
        labelHeader="Title"
        descriptionHeader="Details"
        emptyMessage="No chunks selected yet."
        onRemove={handleRemove}
      />
    </section>
  );
}

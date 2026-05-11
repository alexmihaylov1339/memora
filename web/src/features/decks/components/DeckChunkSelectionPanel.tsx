import { EntitySearch } from '@shared/components';
import { chunkService } from '@features/chunks';
import {
  SEARCH_QUERY_KEYS,
  SEARCH_SELECTION_MODES,
  type SearchResultItem,
} from '@features/search';

import { DECK_SELECTED_ITEMS_PAGE_SIZE } from '../constants';
import DeckSelectedItemsGrid from './DeckSelectedItemsGrid';
import styles from './CreateDeckForm.module.scss';

interface DeckChunkSelectionPanelProps {
  selectedChunks: SearchResultItem[];
  onSelectionChange: (items: SearchResultItem[]) => void;
}

export default function DeckChunkSelectionPanel({
  selectedChunks,
  onSelectionChange,
}: DeckChunkSelectionPanelProps) {
  function handleRemove(item: SearchResultItem) {
    onSelectionChange(
      selectedChunks.filter(
        (chunk) => !(chunk.id === item.id && chunk.type === item.type),
      ),
    );
  }

  return (
    <section className={styles.section}>
      <div className={styles.sectionHeader}>
        <h3 className={styles.sectionTitle}>My Chunks</h3>
        <p className={styles.sectionDescription}>Search and select chunks for this deck.</p>
      </div>

      <EntitySearch
        queryKey={SEARCH_QUERY_KEYS.chunk}
        search={chunkService.search}
        selectionMode={SEARCH_SELECTION_MODES.multiple}
        selectedItems={selectedChunks}
        onSelectionChange={onSelectionChange}
        placeholder="Search chunks"
      />

      <div className="mt-2">
        <DeckSelectedItemsGrid
          id="deck-selected-chunks-grid"
          items={selectedChunks}
          labelHeader="Front"
          descriptionHeader="Back"
          emptyMessage="There are currently no chunks to choose from."
          onRemove={handleRemove}
          paginate
          pageSize={DECK_SELECTED_ITEMS_PAGE_SIZE}
        />
      </div>
    </section>
  );
}

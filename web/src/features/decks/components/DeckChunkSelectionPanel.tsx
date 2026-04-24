import { EntitySearch } from '@shared/components';
import { SEARCH_QUERY_KEYS, SEARCH_SELECTION_MODES, type SearchResultItem } from '@features/search';
import { chunkService } from '@features/chunks';
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
    onSelectionChange(selectedChunks.filter((c) => !(c.id === item.id && c.type === item.type)));
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
        />
      </div>
    </section>
  );
}

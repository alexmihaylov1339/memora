import { EntitySearch, ErrorMessage } from '@shared/components';
import { cardService, type CardRecord } from '@features/decks';
import { SEARCH_QUERY_KEYS, SEARCH_SELECTION_MODES, type SearchResultItem } from '@features/search';
import { MIN_CHUNK_CARD_SELECTION } from '@features/chunks';
import { mapChunkCardToSearchResultItem } from './chunkCreatePreview';
import ChunkSelectedCardsGrid from './ChunkSelectedCardsGrid';

interface ChunkCardSearchPanelProps {
  selectedCards: CardRecord[];
  cardsLoading: boolean;
  cardsError?: string;
  onSelectionChange: (items: SearchResultItem[]) => void;
  onRemoveCard: (cardId: string) => void;
}

export default function ChunkCardSearchPanel({
  selectedCards,
  cardsLoading,
  cardsError,
  onSelectionChange,
  onRemoveCard,
}: ChunkCardSearchPanelProps) {
  return (
    <section className="mt-5">
      <div className="mb-3">
        <h2 className="text-lg font-semibold text-ink-strong">Card Selection</h2>
        <p className="mt-1 text-sm text-ink-subtle">
          Search across all of your cards, select at least {MIN_CHUNK_CARD_SELECTION}, and
          arrange their order for this chunk.
        </p>
      </div>

      <EntitySearch
        queryKey={SEARCH_QUERY_KEYS.card}
        search={cardService.search}
        selectionMode={SEARCH_SELECTION_MODES.multiple}
        selectedItems={selectedCards.map(mapChunkCardToSearchResultItem)}
        onSelectionChange={onSelectionChange}
        placeholder="Search across all in this chunk"
      />

      {cardsLoading && <p className="mt-4 text-sm text-ink-subtle">Loading cards...</p>}
      {cardsError && <ErrorMessage className="mt-4" message={cardsError} />}

      {!cardsLoading && !cardsError && (
        <div className="mt-4">
          <ChunkSelectedCardsGrid
            selectedCards={selectedCards}
            onRemoveCard={onRemoveCard}
          />
        </div>
      )}
    </section>
  );
}

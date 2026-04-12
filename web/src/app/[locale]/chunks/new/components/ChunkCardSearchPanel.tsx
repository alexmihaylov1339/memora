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
  onMoveCard: (cardId: string, offset: -1 | 1) => void;
  onRemoveCard: (cardId: string) => void;
}

export default function ChunkCardSearchPanel({
  selectedCards,
  cardsLoading,
  cardsError,
  onSelectionChange,
  onMoveCard,
  onRemoveCard,
}: ChunkCardSearchPanelProps) {
  return (
    <section className="rounded-lg border border-[var(--border)] bg-white p-5">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Card Selection</h2>
          <p className="mt-1 text-sm text-slate-600">
            Search across all of your cards, select at least {MIN_CHUNK_CARD_SELECTION},
            and arrange their order for this chunk.
          </p>
        </div>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
          {selectedCards.length} selected
        </span>
      </div>

      <EntitySearch
        queryKey={SEARCH_QUERY_KEYS.card}
        search={cardService.search}
        selectionMode={SEARCH_SELECTION_MODES.multiple}
        selectedItems={selectedCards.map(mapChunkCardToSearchResultItem)}
        onSelectionChange={onSelectionChange}
        placeholder="Search cards to add to the chunk"
      />

      {cardsLoading && <p className="mt-4 text-sm text-slate-600">Loading cards...</p>}
      {cardsError && <ErrorMessage className="mt-4" message={cardsError} />}

      {!cardsLoading && !cardsError && (
        <div className="mt-4">
          <ChunkSelectedCardsGrid
            selectedCards={selectedCards}
            onMoveCard={onMoveCard}
            onRemoveCard={onRemoveCard}
          />
        </div>
      )}
    </section>
  );
}

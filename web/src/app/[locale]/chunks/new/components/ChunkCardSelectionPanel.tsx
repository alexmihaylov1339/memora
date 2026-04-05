import type { CardRecord } from '@features/decks';
import { MIN_CHUNK_CARD_SELECTION } from '@features/chunks';
import ChunkAvailableCardsList from './ChunkAvailableCardsList';
import ChunkSelectedCardsList from './ChunkSelectedCardsList';

interface ChunkCardSelectionPanelProps {
  selectedCards: CardRecord[];
  availableCards: CardRecord[];
  isLoading: boolean;
  error?: string;
  onAddCard: (cardId: string) => void;
  onMoveCard: (cardId: string, offset: -1 | 1) => void;
  onRemoveCard: (cardId: string) => void;
}

export default function ChunkCardSelectionPanel({
  selectedCards,
  availableCards,
  isLoading,
  error,
  onAddCard,
  onMoveCard,
  onRemoveCard,
}: ChunkCardSelectionPanelProps) {
  return (
    <section className="rounded-lg border border-[var(--border)] bg-white p-5">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Card Order</h2>
          <p className="mt-1 text-sm text-slate-600">
            Select at least {MIN_CHUNK_CARD_SELECTION} card and arrange the review order.
          </p>
        </div>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
          {selectedCards.length} selected
        </span>
      </div>

      {isLoading && <p className="text-sm text-slate-600">Loading deck cards...</p>}
      {error && <p className="text-sm text-[var(--destructive)]">{error}</p>}

      {!isLoading && !error && (
        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
              Selected Cards
            </h3>
            <ChunkSelectedCardsList
              selectedCards={selectedCards}
              onMoveCard={onMoveCard}
              onRemoveCard={onRemoveCard}
            />
          </div>

          <div>
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
              Available Deck Cards
            </h3>
            <ChunkAvailableCardsList
              availableCards={availableCards}
              onAddCard={onAddCard}
            />
          </div>
        </div>
      )}
    </section>
  );
}

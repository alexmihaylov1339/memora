import type { CardRecord } from '@features/decks';
import ChunkCardSelectionPanel from './ChunkCardSelectionPanel';
import ChunkCreateDetailsCard from './ChunkCreateDetailsCard';
import ChunkSchedulePreview from './ChunkSchedulePreview';

interface ChunkCreateFormProps {
  activeDeckId: string;
  cardsError?: string;
  cardsLoading: boolean;
  currentDeckName?: string;
  onAddCard: (cardId: string) => void;
  onChangeDeck: () => void;
  onMoveCard: (cardId: string, offset: -1 | 1) => void;
  onRemoveCard: (cardId: string) => void;
  onSubmit: (values: { title: string }) => Promise<void> | void;
  selectedCards: CardRecord[];
  submitError?: string;
  submitLoading: boolean;
  unselectedCards: CardRecord[];
}

export default function ChunkCreateForm({
  activeDeckId,
  cardsError,
  cardsLoading,
  currentDeckName,
  onAddCard,
  onChangeDeck,
  onMoveCard,
  onRemoveCard,
  onSubmit,
  selectedCards,
  submitError,
  submitLoading,
  unselectedCards,
}: ChunkCreateFormProps) {
  return (
    <div className="space-y-6">
      <ChunkCreateDetailsCard
        activeDeckId={activeDeckId}
        cardsError={cardsError}
        cardsLoading={cardsLoading}
        currentDeckName={currentDeckName}
        onChangeDeck={onChangeDeck}
        onSubmit={onSubmit}
        selectedCardCount={selectedCards.length}
        submitError={submitError}
        submitLoading={submitLoading}
        unselectedCardCount={unselectedCards.length}
      />

      <ChunkCardSelectionPanel
        availableCards={unselectedCards}
        error={cardsError}
        isLoading={cardsLoading}
        onAddCard={onAddCard}
        onMoveCard={onMoveCard}
        onRemoveCard={onRemoveCard}
        selectedCards={selectedCards}
      />

      <ChunkSchedulePreview />
    </div>
  );
}

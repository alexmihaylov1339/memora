import type { CardRecord } from '@features/decks';
import type { SearchResultItem } from '@features/search';
import ChunkCreateDetailsCard from './ChunkCreateDetailsCard';

interface ChunkCreateFormProps {
  activeDeckId: string;
  cardsError?: string;
  cardsLoading: boolean;
  currentDeckName?: string;
  onChangeDeck: () => void;
  onSelectionChange: (items: SearchResultItem[]) => void;
  onRemoveCard: (cardId: string) => void;
  onSubmit: (values: { title: string; cardIds: string[] }) => Promise<void> | void;
  selectedCards: CardRecord[];
  submitError?: string;
  submitLoading: boolean;
  totalCardCount: number;
}

export default function ChunkCreateForm({
  activeDeckId,
  cardsError,
  cardsLoading,
  currentDeckName,
  onChangeDeck,
  onSelectionChange,
  onRemoveCard,
  onSubmit,
  selectedCards,
  submitError,
  submitLoading,
  totalCardCount,
}: ChunkCreateFormProps) {
  return (
    <div className="mx-auto w-full max-w-[460px]">
      <ChunkCreateDetailsCard
        activeDeckId={activeDeckId}
        cardsError={cardsError}
        cardsLoading={cardsLoading}
        currentDeckName={currentDeckName}
        onChangeDeck={onChangeDeck}
        onSelectionChange={onSelectionChange}
        onRemoveCard={onRemoveCard}
        onSubmit={onSubmit}
        selectedCards={selectedCards}
        submitError={submitError}
        submitLoading={submitLoading}
        availableCardCount={totalCardCount}
      />
    </div>
  );
}

import type { CardRecord } from '@features/decks';
import type { SearchResultItem } from '@features/search';
import ChunkCreateDetailsCard from './ChunkCreateDetailsCard';

interface ChunkCreateFormProps {
  cardsError?: string;
  cardsLoading: boolean;
  onSelectionChange: (items: SearchResultItem[]) => void;
  onRemoveCard: (cardId: string) => void;
  onSubmit: (values: { title: string; cardIds: string[] }) => Promise<void> | void;
  selectedCards: CardRecord[];
  submitError?: string;
  submitLoading: boolean;
}

export default function ChunkCreateForm({
  cardsError,
  cardsLoading,
  onSelectionChange,
  onRemoveCard,
  onSubmit,
  selectedCards,
  submitError,
  submitLoading,
}: ChunkCreateFormProps) {
  return (
    <div className="mx-auto w-full max-w-[621px]">
      <ChunkCreateDetailsCard
        cardsError={cardsError}
        cardsLoading={cardsLoading}
        onSelectionChange={onSelectionChange}
        onRemoveCard={onRemoveCard}
        onSubmit={onSubmit}
        selectedCards={selectedCards}
        submitError={submitError}
        submitLoading={submitLoading}
      />
    </div>
  );
}

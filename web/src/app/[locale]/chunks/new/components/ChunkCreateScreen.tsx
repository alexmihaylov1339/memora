import { useChunkCreateScreen } from '@features/chunks';
import ChunkCreateForm from './ChunkCreateForm';

interface ChunkCreateScreenProps {
  initialDeckId: string;
}

export default function ChunkCreateScreen({
  initialDeckId,
}: ChunkCreateScreenProps) {
  const {
    activeDeckId,
    cardsError,
    cardsLoading,
    createChunkLoading,
    currentDeck,
    selectedCards,
    submitError,
    totalCardCount,
    handleCreateChunk,
    handleMoveCard,
    handleRemoveCard,
    handleResetDeckSelection,
    handleSelectionChange,
  } = useChunkCreateScreen(initialDeckId);

  return (
    <ChunkCreateForm
      activeDeckId={activeDeckId}
      cardsError={cardsError}
      cardsLoading={cardsLoading}
      currentDeckName={currentDeck?.name}
      onChangeDeck={handleResetDeckSelection}
      onSelectionChange={handleSelectionChange}
      onMoveCard={handleMoveCard}
      onRemoveCard={handleRemoveCard}
      onSubmit={handleCreateChunk}
      selectedCards={selectedCards}
      submitError={submitError}
      submitLoading={createChunkLoading}
      totalCardCount={totalCardCount}
    />
  );
}

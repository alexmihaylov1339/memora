import { useChunkCreateScreen } from '@features/chunks';
import ChunkCreateForm from './ChunkCreateForm';
import ChunkDeckSelectionForm from './ChunkDeckSelectionForm';

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
    deckSelectionError,
    decks,
    decksLoading,
    hasDeckContext,
    hasNoDecks,
    selectedCards,
    submitError,
    unselectedCards,
    handleAddCard,
    handleCreateChunk,
    handleDeckSelection,
    handleMoveCard,
    handleRemoveCard,
    handleResetDeckSelection,
  } = useChunkCreateScreen(initialDeckId);

  if (!hasDeckContext) {
    return (
      <ChunkDeckSelectionForm
        decks={decks}
        error={deckSelectionError}
        hasNoDecks={hasNoDecks}
        isLoading={decksLoading}
        onSubmit={handleDeckSelection}
      />
    );
  }

  return (
    <ChunkCreateForm
      activeDeckId={activeDeckId}
      cardsError={cardsError}
      cardsLoading={cardsLoading}
      currentDeckName={currentDeck?.name}
      onAddCard={handleAddCard}
      onChangeDeck={handleResetDeckSelection}
      onMoveCard={handleMoveCard}
      onRemoveCard={handleRemoveCard}
      onSubmit={handleCreateChunk}
      selectedCards={selectedCards}
      submitError={submitError}
      submitLoading={createChunkLoading}
      unselectedCards={unselectedCards}
    />
  );
}

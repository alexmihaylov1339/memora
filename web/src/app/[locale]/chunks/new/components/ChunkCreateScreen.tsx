import { useChunkCreateScreen } from '@features/chunks';
import ChunkCreateForm from './ChunkCreateForm';

interface ChunkCreateScreenProps {
  initialDeckId: string;
}

export default function ChunkCreateScreen({
  initialDeckId,
}: ChunkCreateScreenProps) {
  const {
    cardsError,
    cardsLoading,
    createChunkLoading,
    selectedCards,
    submitError,
    handleCreateChunk,
    handleRemoveCard,
    handleSelectionChange,
  } = useChunkCreateScreen(initialDeckId);

  return (
    <ChunkCreateForm
      cardsError={cardsError}
      cardsLoading={cardsLoading}
      onSelectionChange={handleSelectionChange}
      onRemoveCard={handleRemoveCard}
      onSubmit={handleCreateChunk}
      selectedCards={selectedCards}
      submitError={submitError}
      submitLoading={createChunkLoading}
    />
  );
}

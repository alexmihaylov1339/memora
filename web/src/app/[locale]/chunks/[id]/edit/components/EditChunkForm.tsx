import { Button, ErrorMessage, FormBuilder } from '@shared/components';
import { useChunkCreateFormFields } from '@features/chunks';
import { type CardRecord } from '@features/decks';
import type { SearchResultItem } from '@features/search';
import ChunkCardSearchPanel from '../../../new/components/ChunkCardSearchPanel';

export interface EditChunkFormProps {
  chunkId: string;
  title: string;
  selectedCards: CardRecord[];
  cardsLoading: boolean;
  cardsError?: string;
  submitError?: string;
  submitLoading: boolean;
  deleteError?: string;
  isDeleting: boolean;
  onSelectionChange: (items: SearchResultItem[]) => void;
  onMoveCard: (cardId: string, offset: -1 | 1) => void;
  onRemoveCard: (cardId: string) => void;
  onSubmit: (values: { title: string }) => Promise<void> | void;
  onDelete: () => void;
}

export default function EditChunkForm({
  chunkId,
  title,
  selectedCards,
  cardsLoading,
  cardsError,
  submitError,
  submitLoading,
  deleteError,
  isDeleting,
  onSelectionChange,
  onMoveCard,
  onRemoveCard,
  onSubmit,
  onDelete,
}: EditChunkFormProps) {
  const fields = useChunkCreateFormFields();

  return (
    <div>
      <FormBuilder<{ title: string }>
        key={chunkId}
        fields={fields}
        initialValues={{ title }}
        onSubmit={onSubmit}
        submitLabel={submitLoading ? 'Saving Chunk...' : 'Save Chunk'}
        translateFields={false}
        errorMessage={submitError}
        resetOnSubmit={false}
      />

      <ChunkCardSearchPanel
        cardsError={cardsError}
        cardsLoading={cardsLoading}
        onSelectionChange={onSelectionChange}
        onMoveCard={onMoveCard}
        onRemoveCard={onRemoveCard}
        selectedCards={selectedCards}
      />

      {deleteError && <ErrorMessage message={deleteError} />}

      <Button type="button" onClick={onDelete} isLoading={isDeleting}>
        Delete Chunk
      </Button>
    </div>
  );
}

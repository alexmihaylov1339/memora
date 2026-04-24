import { useMemo } from 'react';
import { Button, ErrorMessage, FormBuilder, type FieldConfig } from '@shared/components';
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
  onSubmit: (values: { title: string; cardIds: string[] }) => Promise<void> | void;
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
  const baseFields = useChunkCreateFormFields();
  const fields = useMemo<FieldConfig[]>(
    () => [
      ...baseFields,
      {
        type: 'grid',
        name: 'cardIds',
        label: 'Cards',
        value: selectedCards,
        onChange: (value) => onSelectionChange(value as SearchResultItem[]),
        serialize: (value) => (value as CardRecord[]).map((card) => card.id),
        fieldWrapperClassName: 'mt-6',
        render: ({ value, onChange }) => (
          <ChunkCardSearchPanel
            cardsError={cardsError}
            cardsLoading={cardsLoading}
            onSelectionChange={(items) => onChange(items)}
            onMoveCard={onMoveCard}
            onRemoveCard={onRemoveCard}
            selectedCards={value as CardRecord[]}
          />
        ),
      },
    ],
    [
      baseFields,
      cardsError,
      cardsLoading,
      onMoveCard,
      onRemoveCard,
      onSelectionChange,
      selectedCards,
    ],
  );

  return (
    <div>
      <FormBuilder<{ title: string; cardIds: string[] }>
        key={chunkId}
        fields={fields}
        initialValues={{ title }}
        onSubmit={onSubmit}
        submitLabel={submitLoading ? 'Saving Chunk...' : 'Save Chunk'}
        translateFields={false}
        errorMessage={submitError}
        resetOnSubmit={false}
      />

      {deleteError && <ErrorMessage message={deleteError} />}

      <Button type="button" onClick={onDelete} isLoading={isDeleting}>
        Delete Chunk
      </Button>
    </div>
  );
}

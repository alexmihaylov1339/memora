import { useMemo } from 'react';
import { ErrorMessage, FormBuilder, type FieldConfig } from '@shared/components';
import { BUTTON_STYLES } from '@shared/constants';
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
      onRemoveCard,
      onSelectionChange,
      selectedCards,
    ],
  );

  return (
    <div className="rounded-[4px] border border-line-soft bg-white px-8 pb-[30px] pt-6">
      <FormBuilder<{ title: string; cardIds: string[] }>
        key={chunkId}
        fields={fields}
        initialValues={{ title }}
        onSubmit={onSubmit}
        submitLabel={submitLoading ? 'Saving Chunk...' : 'Save Chunk'}
        submitButtonClassName={BUTTON_STYLES.primarySolid}
        actionsContainerClassName="mt-6 flex items-center justify-between gap-3"
        showDeleteButton
        deleteLabel="Delete Chunk"
        deleteButtonClassName={BUTTON_STYLES.destructiveSolid}
        onDelete={onDelete}
        isDeleting={isDeleting}
        translateFields={false}
        errorMessage={submitError}
        resetOnSubmit={false}
      />

      {deleteError && <ErrorMessage className="mt-3" message={deleteError} />}
    </div>
  );
}

import { useMemo } from 'react';
import { FormBuilder, type FieldConfig } from '@shared/components';
import { BUTTON_STYLES } from '@shared/constants';
import { useChunkCreateFormFields } from '@features/chunks';
import type { CardRecord } from '@features/decks';
import type { SearchResultItem } from '@features/search';
import ChunkCardSearchPanel from './ChunkCardSearchPanel';

const CREATE_CHUNK_LABEL = 'Create Chunk';
const CREATING_CHUNK_LABEL = 'Creating Chunk...';

interface ChunkCreateDetailsCardProps {
  cardsError?: string;
  cardsLoading: boolean;
  onSelectionChange: (items: SearchResultItem[]) => void;
  onRemoveCard: (cardId: string) => void;
  onSubmit: (values: { title: string; cardIds: string[] }) => Promise<void> | void;
  selectedCards: CardRecord[];
  submitError?: string;
  submitLoading: boolean;
}

export default function ChunkCreateDetailsCard({
  cardsError,
  cardsLoading,
  onSelectionChange,
  onRemoveCard,
  onSubmit,
  selectedCards,
  submitError,
  submitLoading,
}: ChunkCreateDetailsCardProps) {
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
        fields={fields}
        onSubmit={onSubmit}
        submitLabel={submitLoading ? CREATING_CHUNK_LABEL : CREATE_CHUNK_LABEL}
        submitButtonClassName={BUTTON_STYLES.primarySolid}
        actionsContainerClassName="mt-6 flex items-center justify-end gap-3"
        translateFields={false}
        errorMessage={submitError}
        resetOnSubmit={false}
      />
    </div>
  );
}

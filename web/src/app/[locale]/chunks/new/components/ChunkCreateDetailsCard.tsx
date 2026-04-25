import { useMemo } from 'react';
import { ErrorMessage, FormBuilder, type FieldConfig } from '@shared/components';
import { BUTTON_STYLES } from '@shared/constants';
import { useChunkCreateFormFields } from '@features/chunks';
import type { CardRecord } from '@features/decks';
import type { SearchResultItem } from '@features/search';
import ChunkCardSearchPanel from './ChunkCardSearchPanel';

const CREATE_CHUNK_LABEL = 'Create Chunk';
const CREATING_CHUNK_LABEL = 'Creating Chunk...';

interface ChunkCreateDetailsCardProps {
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
  availableCardCount: number;
}

export default function ChunkCreateDetailsCard({
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
  availableCardCount,
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
  const showForm =
    selectedCards.length > 0 || availableCardCount > 0 || cardsLoading;

  return (
    <section className="rounded-[4px] border border-line-soft bg-white p-3">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-ink-strong">Chunk Details</h2>
          <p className="mt-1 text-sm text-ink-subtle">
            A title is required for this chunk.
          </p>
        </div>

        <div className="text-right">
          <p className="text-xs text-ink-subtle">Attached to deck (un-linked)</p>
          <p className="mt-1 text-sm font-semibold text-ink-strong">
            {currentDeckName ?? (activeDeckId ? activeDeckId : 'Unassigned')}
          </p>
          {activeDeckId && (
            <>
              <button
                type="button"
                onClick={onChangeDeck}
                className="mt-1 text-sm text-[var(--primary)] hover:underline"
              >
                Create as Unassigned
              </button>
            </>
          )}
        </div>
      </div>

      {cardsError && <ErrorMessage className="mt-4" message={cardsError} />}

      {showForm && (
        <div className="mt-4">
          <FormBuilder<{ title: string; cardIds: string[] }>
            fields={fields}
            onSubmit={onSubmit}
            submitLabel={submitLoading ? CREATING_CHUNK_LABEL : CREATE_CHUNK_LABEL}
            submitButtonClassName={`${BUTTON_STYLES.primarySolid} mt-3 ml-auto block`}
            translateFields={false}
            errorMessage={submitError}
            resetOnSubmit={false}
          />
        </div>
      )}
    </section>
  );
}

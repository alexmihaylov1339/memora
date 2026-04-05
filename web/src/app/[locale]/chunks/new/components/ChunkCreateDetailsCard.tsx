import { ErrorMessage, FormBuilder } from '@shared/components';
import { useChunkCreateFormFields } from '@features/chunks';
import ChunkCreateEmptyDeckState from './ChunkCreateEmptyDeckState';

const CREATE_CHUNK_LABEL = 'Create Chunk';
const CREATING_CHUNK_LABEL = 'Creating Chunk...';

interface ChunkCreateDetailsCardProps {
  activeDeckId: string;
  cardsError?: string;
  cardsLoading: boolean;
  currentDeckName?: string;
  onChangeDeck: () => void;
  onSubmit: (values: { title: string }) => Promise<void> | void;
  selectedCardCount: number;
  submitError?: string;
  submitLoading: boolean;
  unselectedCardCount: number;
}

export default function ChunkCreateDetailsCard({
  activeDeckId,
  cardsError,
  cardsLoading,
  currentDeckName,
  onChangeDeck,
  onSubmit,
  selectedCardCount,
  submitError,
  submitLoading,
  unselectedCardCount,
}: ChunkCreateDetailsCardProps) {
  const fields = useChunkCreateFormFields();
  const showEmptyDeckState =
    !cardsLoading &&
    !cardsError &&
    unselectedCardCount === 0 &&
    selectedCardCount === 0;
  const showForm =
    selectedCardCount > 0 || unselectedCardCount > 0 || cardsLoading;

  return (
    <section className="rounded-lg border border-[var(--border)] bg-white p-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Chunk Details</h2>
          <p className="mt-1 text-sm text-slate-600">
            Choose a clear title and build the card order for this chunk.
          </p>
        </div>

        <div className="text-right">
          <p className="text-xs uppercase tracking-wide text-slate-500">Current Deck</p>
          <p className="mt-1 font-medium text-slate-900">
            {currentDeckName ?? activeDeckId}
          </p>
          <p className="mt-1 font-mono text-xs text-slate-500">{activeDeckId}</p>
          <button
            type="button"
            onClick={onChangeDeck}
            className="mt-3 text-sm text-[var(--primary)] hover:underline"
          >
            Change Deck
          </button>
        </div>
      </div>

      {cardsError && <ErrorMessage className="mt-4" message={cardsError} />}

      {showEmptyDeckState && <ChunkCreateEmptyDeckState activeDeckId={activeDeckId} />}

      {showForm && (
        <div className="mt-4">
          <FormBuilder<{ title: string }>
            fields={fields}
            onSubmit={onSubmit}
            submitLabel={submitLoading ? CREATING_CHUNK_LABEL : CREATE_CHUNK_LABEL}
            submitButtonClassName="rounded-md bg-[var(--primary)] px-4 py-2 text-white disabled:opacity-60"
            translateFields={false}
            errorMessage={submitError}
            resetOnSubmit={false}
          />
        </div>
      )}
    </section>
  );
}

import { FormBuilder, ErrorMessage, PageLoader } from '@shared/components';
import type { Deck } from '@features/decks';
import { APP_ROUTES } from '@shared/constants';
import { useChunkDeckSelectionFields } from '@features/chunks';
import { Link } from '@/i18n/navigation';

interface ChunkDeckSelectionFormProps {
  decks: Deck[];
  isLoading: boolean;
  error?: string;
  hasNoDecks: boolean;
  onSubmit: (values: { deckId?: string }) => Promise<void> | void;
}

export default function ChunkDeckSelectionForm({
  decks,
  isLoading,
  error,
  hasNoDecks,
  onSubmit,
}: ChunkDeckSelectionFormProps) {
  const fields = useChunkDeckSelectionFields(decks);

  return (
    <section className="rounded-lg border border-[var(--border)] bg-white p-5">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-slate-900">Choose Deck</h2>
        <p className="mt-1 text-sm text-slate-600">
          Pick the deck whose cards will be assembled into an ordered chunk.
        </p>
      </div>

      {isLoading && <PageLoader />}
      {error && <ErrorMessage message={error} />}

      {!isLoading && hasNoDecks && (
        <div className="rounded-md border border-dashed border-slate-300 bg-slate-50 p-4">
          <p className="text-sm text-slate-700">You need a deck before creating a chunk.</p>
          <p className="mt-1 text-sm text-slate-500">
            Create a deck first, then come back here to assemble its cards into a chunk.
          </p>
          <Link
            href={APP_ROUTES.newDeck}
            className="mt-4 inline-flex rounded-md bg-[var(--primary)] px-4 py-2 text-sm font-medium text-white hover:opacity-90"
          >
            Create Deck
          </Link>
        </div>
      )}

      {!isLoading && !hasNoDecks && decks.length > 0 && (
        <FormBuilder<{ deckId?: string }>
          fields={fields}
          onSubmit={onSubmit}
          submitLabel="Use Deck"
          submitButtonClassName="rounded-md bg-[var(--primary)] px-4 py-2 text-white disabled:opacity-60"
          translateFields={false}
          resetOnSubmit={false}
        />
      )}
    </section>
  );
}

import { Link } from '@/i18n/navigation';

import { Button, FormBuilder } from '@shared/components';
import { useDeckEditFormFields } from '@features/decks';

type DeckEditFormProps = {
  id: string;
  name: string;
  description?: string;
  onUpdate: (payload: { id: string; name: string; description?: string }) => void;
  onDelete: () => void;
  isDeleting: boolean;
  updateError?: string;
  deleteError?: string;
};

export default function DeckEditForm({
  id,
  name,
  description,
  onUpdate,
  onDelete,
  isDeleting,
  updateError,
  deleteError,
}: DeckEditFormProps) {
  const fields = useDeckEditFormFields();

  return (
    <div className="space-y-4 rounded-lg border border-[var(--border)] bg-white p-4">
      <FormBuilder<{ name: string; description?: string }>
        fields={fields}
        initialValues={{ name, description: description ?? '' }}
        onSubmit={(values) =>
          onUpdate({
            id,
            name: (values.name ?? '').trim(),
            description: values.description?.trim() || undefined,
          })
        }
        submitLabel="Save Deck"
        submitButtonClassName="rounded-md bg-[var(--primary)] px-4 py-2 text-white disabled:opacity-60"
        errorMessage={updateError}
        translateFields={false}
      />

      {deleteError && <p className="text-sm text-[var(--destructive)]">{deleteError}</p>}

      <div className="flex flex-wrap items-center gap-3">
        <Link
          href={{ pathname: '/cards/new', query: { deckId: id } }}
          className="rounded-md border border-[var(--border)] bg-white px-4 py-2 text-sm hover:bg-slate-50"
        >
          Add Card
        </Link>

        <Link
          href={{ pathname: '/chunks/new', query: { deckId: id } }}
          className="rounded-md border border-[var(--border)] bg-white px-4 py-2 text-sm hover:bg-slate-50"
        >
          Add Chunk
        </Link>

        <Button
          onClick={onDelete}
          isLoading={isDeleting}
          className="rounded-md border border-[var(--destructive)] px-4 py-2 text-[var(--destructive)] disabled:opacity-60"
        >
          Delete Deck
        </Button>
      </div>
    </div>
  );
}

import { Link } from '@/i18n/navigation';

interface DeckWorkspaceHeaderProps {
  deckId: string;
}

export default function DeckWorkspaceHeader({
  deckId,
}: DeckWorkspaceHeaderProps) {
  return (
    <div className="rounded-lg border border-[var(--border)] bg-[linear-gradient(135deg,#fff7ed_0%,#ffffff_65%)] p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Workspace</h2>
          <p className="mt-1 text-sm text-slate-600">
            Create cards, assemble chunks, and keep this deck ready for the review flow.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Link
            href={{ pathname: '/cards/new', query: { deckId } }}
            className="rounded-md bg-[var(--primary)] px-4 py-2 text-sm font-medium text-white hover:opacity-90"
          >
            Add Card
          </Link>

          <Link
            href={{ pathname: '/chunks/new', query: { deckId } }}
            className="rounded-md border border-[var(--border)] bg-white px-4 py-2 text-sm hover:bg-slate-50"
          >
            Add Chunk
          </Link>

          <span
            aria-disabled="true"
            className="rounded-md border border-dashed border-slate-300 bg-slate-50 px-4 py-2 text-sm text-slate-500"
          >
            Review UI in T6
          </span>
        </div>
      </div>
    </div>
  );
}

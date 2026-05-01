import { Link } from '@/i18n/navigation';

import { APP_ROUTES } from '@shared/constants';

interface PracticeHeaderProps {
  deckId: string | null;
  positionLabel: string;
}

export default function PracticeHeader({
  deckId,
  positionLabel,
}: PracticeHeaderProps) {
  return (
    <header className="flex flex-wrap items-center justify-between gap-3">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Practice</h1>
        <p className="mt-1 text-sm text-slate-600">{positionLabel}</p>
      </div>

      <div className="flex flex-wrap gap-3">
        {deckId && (
          <Link
            href={APP_ROUTES.deckReview(deckId)}
            className="rounded-md bg-[var(--primary)] px-4 py-2 text-sm font-medium text-white hover:opacity-90"
          >
            Review Due Cards
          </Link>
        )}
        <Link
          href={APP_ROUTES.decks}
          className="rounded-md border border-[var(--border)] px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          Back to Decks
        </Link>
      </div>
    </header>
  );
}

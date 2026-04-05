import { Link } from '@/i18n/navigation';

import { APP_ROUTES } from '@shared/constants';

export default function ReviewEmptyState() {
  return (
    <section className="rounded-lg border border-[var(--border)] bg-white p-6">
      <h2 className="text-lg font-semibold text-slate-900">Nothing due right now</h2>
      <p className="mt-2 text-sm text-slate-600">
        Your review queue is empty. Create more chunks or come back when the next review is due.
      </p>

      <div className="mt-4 flex flex-wrap gap-3">
        <Link
          href={APP_ROUTES.decks}
          className="rounded-md bg-[var(--primary)] px-4 py-2 text-sm font-medium text-white hover:opacity-90"
        >
          Go to Decks
        </Link>
      </div>
    </section>
  );
}

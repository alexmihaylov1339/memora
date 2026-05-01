import { Link } from '@/i18n/navigation';

import { APP_ROUTES } from '@shared/constants';

interface PracticeEmptyStateProps {
  description: string;
  title: string;
}

export default function PracticeEmptyState({
  description,
  title,
}: PracticeEmptyStateProps) {
  return (
    <section className="rounded-lg border border-[var(--border)] bg-white p-6">
      <h1 className="text-lg font-semibold text-slate-900">{title}</h1>
      <p className="mt-2 text-sm text-slate-600">{description}</p>
      <Link
        href={APP_ROUTES.decks}
        className="mt-4 inline-flex rounded-md bg-[var(--primary)] px-4 py-2 text-sm font-medium text-white hover:opacity-90"
      >
        Back to Decks
      </Link>
    </section>
  );
}

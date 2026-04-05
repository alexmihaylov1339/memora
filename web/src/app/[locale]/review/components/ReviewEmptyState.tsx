import { Link } from '@/i18n/navigation';
import { Button } from '@shared/components';

import { APP_ROUTES } from '@shared/constants';

interface ReviewEmptyStateProps {
  actionLabel?: string;
  description?: string;
  onAction?: () => Promise<void> | void;
  title?: string;
}

export default function ReviewEmptyState({
  actionLabel,
  description = 'Your review queue is empty. Create more chunks or come back when the next review is due.',
  onAction,
  title = 'Nothing due right now',
}: ReviewEmptyStateProps) {
  return (
    <section className="rounded-lg border border-[var(--border)] bg-white p-6">
      <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
      <p className="mt-2 text-sm text-slate-600">{description}</p>

      <div className="mt-4 flex flex-wrap gap-3">
        {onAction && actionLabel ? (
          <Button
            type="button"
            onClick={() => void onAction()}
            className="rounded-md bg-[var(--primary)] px-4 py-2 text-sm font-medium text-white hover:opacity-90"
          >
            {actionLabel}
          </Button>
        ) : (
          <Link
            href={APP_ROUTES.decks}
            className="rounded-md bg-[var(--primary)] px-4 py-2 text-sm font-medium text-white hover:opacity-90"
          >
            Go to Decks
          </Link>
        )}
      </div>
    </section>
  );
}

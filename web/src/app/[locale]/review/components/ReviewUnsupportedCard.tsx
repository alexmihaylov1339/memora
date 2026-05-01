import type { ReviewRenderableItem } from '@features/reviews';
import { REVIEW_UNSUPPORTED_REASONS } from '@features/reviews/types';
import type { ReviewUnsupportedReason } from '@features/reviews/types';
import { Link } from '@/i18n/navigation';
import { Button } from '@shared/components';
import { APP_ROUTES } from '@shared/constants';

interface ReviewUnsupportedCardProps {
  item: ReviewRenderableItem;
  onRefreshQueue: () => Promise<void> | void;
  reason?: ReviewUnsupportedReason;
}

export default function ReviewUnsupportedCard({
  item,
  onRefreshQueue,
  reason,
}: ReviewUnsupportedCardProps) {
  const detail =
    reason === REVIEW_UNSUPPORTED_REASONS.invalidPayload
      ? 'The card payload is invalid for this renderer.'
      : 'This kind is not review-enabled yet.';
  const reasonLabel =
    reason === REVIEW_UNSUPPORTED_REASONS.invalidPayload
      ? 'Invalid payload'
      : 'Kind not review-enabled';

  return (
    <section className="rounded-lg border border-[var(--border)] bg-white p-6">
      <h2 className="text-lg font-semibold text-slate-900">Unsupported card kind</h2>
      <p className="mt-2 text-sm text-slate-600">
        This review page cannot render the current item safely. The queue item kind is{' '}
        <span className="font-semibold">{item.kind}</span>.
      </p>
      <p className="mt-2 text-sm text-slate-600">{detail}</p>

      <dl className="mt-4 text-sm text-slate-700">
        <div className="rounded-md bg-slate-50 p-3">
          <dt className="text-xs uppercase tracking-wide text-slate-500">Reason</dt>
          <dd className="mt-1 font-semibold text-slate-900">{reasonLabel}</dd>
        </div>
      </dl>

      <div className="mt-4 flex flex-wrap gap-3">
        <Button
          type="button"
          onClick={() => void onRefreshQueue()}
          className="rounded-md bg-[var(--primary)] px-4 py-2 text-sm font-medium text-white hover:opacity-90"
        >
          Refresh Queue
        </Button>
        <Link
          href={APP_ROUTES.decks}
          className="rounded-md border border-[var(--border)] px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          Open Decks
        </Link>
      </div>
    </section>
  );
}

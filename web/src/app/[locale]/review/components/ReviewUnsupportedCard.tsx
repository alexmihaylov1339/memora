import type { ReviewQueueItem } from '@features/reviews';
import { REVIEW_UNSUPPORTED_REASONS } from '@features/reviews/types';
import type { ReviewUnsupportedReason } from '@features/reviews/types';

interface ReviewUnsupportedCardProps {
  item: ReviewQueueItem;
  reason?: ReviewUnsupportedReason;
}

export default function ReviewUnsupportedCard({
  item,
  reason,
}: ReviewUnsupportedCardProps) {
  const detail =
    reason === REVIEW_UNSUPPORTED_REASONS.invalidPayload
      ? 'The card payload is invalid for this renderer.'
      : 'This kind is not review-enabled yet.';

  return (
    <section className="rounded-lg border border-[var(--border)] bg-white p-6">
      <h2 className="text-lg font-semibold text-slate-900">Unsupported card kind</h2>
      <p className="mt-2 text-sm text-slate-600">
        This review page cannot render the current item safely. The queue item kind is{' '}
        <span className="font-semibold">{item.kind}</span>.
      </p>
      <p className="mt-2 text-sm text-slate-600">{detail}</p>
    </section>
  );
}

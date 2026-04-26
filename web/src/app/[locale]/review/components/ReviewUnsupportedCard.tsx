import type { ReviewQueueItem } from '@features/reviews';

interface ReviewUnsupportedCardProps {
  item: ReviewQueueItem;
  reason?: string;
}

export default function ReviewUnsupportedCard({
  item,
  reason,
}: ReviewUnsupportedCardProps) {
  const detail =
    reason === 'invalid_payload'
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

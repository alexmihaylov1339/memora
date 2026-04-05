import type { ReviewQueueItem } from '@features/reviews';

interface ReviewUnsupportedCardProps {
  item: ReviewQueueItem;
}

export default function ReviewUnsupportedCard({
  item,
}: ReviewUnsupportedCardProps) {
  return (
    <section className="rounded-lg border border-[var(--border)] bg-white p-6">
      <h2 className="text-lg font-semibold text-slate-900">Unsupported card kind</h2>
      <p className="mt-2 text-sm text-slate-600">
        This review page currently renders `basic` cards only. The current queue item kind is{' '}
        <span className="font-semibold">{item.kind}</span>.
      </p>
    </section>
  );
}

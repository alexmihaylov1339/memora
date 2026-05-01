import type { ReviewRenderableItem, ReviewUnsupportedReason } from '@features/reviews';
import { REVIEW_UNSUPPORTED_REASONS } from '@features/reviews/types';

interface PracticeUnsupportedCardProps {
  item: ReviewRenderableItem;
  reason?: ReviewUnsupportedReason | null;
}

export default function PracticeUnsupportedCard({
  item,
  reason,
}: PracticeUnsupportedCardProps) {
  const reasonLabel =
    reason === REVIEW_UNSUPPORTED_REASONS.invalidPayload
      ? 'Invalid payload'
      : 'Kind not review-enabled';
  const description =
    reason === REVIEW_UNSUPPORTED_REASONS.invalidPayload
      ? 'This card has saved fields that do not match its renderer contract.'
      : 'This card kind can be read here, but it does not have a practice renderer yet.';

  return (
    <section className="rounded-lg border border-[var(--border)] bg-white p-6">
      <p className="text-xs uppercase tracking-wide text-slate-500">
        Unsupported practice card
      </p>
      <h2 className="mt-2 text-lg font-semibold text-slate-900">
        {item.kind}
      </h2>
      <p className="mt-2 text-sm text-slate-600">{description}</p>
      <p className="mt-4 rounded-md bg-slate-50 p-3 text-sm font-medium text-slate-700">
        {reasonLabel}
      </p>
    </section>
  );
}

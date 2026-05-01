import type { SupportedReviewRenderer } from '@features/reviews';
import ReviewAnswerCard from './ReviewAnswerCard';

interface ReviewCurrentItemCardProps {
  reviewRenderer: SupportedReviewRenderer;
  isAnswerRevealed: boolean;
  onRevealAnswer: () => void;
}

export default function ReviewCurrentItemCard({
  reviewRenderer,
  isAnswerRevealed,
  onRevealAnswer,
}: ReviewCurrentItemCardProps) {
  return (
    <section className="rounded-lg border border-[var(--border)] bg-white p-6">
      <ReviewAnswerCard
        reviewRenderer={reviewRenderer}
        isAnswerRevealed={isAnswerRevealed}
        onRevealAnswer={onRevealAnswer}
      />
    </section>
  );
}

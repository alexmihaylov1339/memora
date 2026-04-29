import type { BasicReviewCardFields } from '@features/reviews';
import ReviewAnswerCard from './ReviewAnswerCard';

interface ReviewCurrentItemCardProps {
  basicCardFields: BasicReviewCardFields;
  isAnswerRevealed: boolean;
  onRevealAnswer: () => void;
}

export default function ReviewCurrentItemCard({
  basicCardFields,
  isAnswerRevealed,
  onRevealAnswer,
}: ReviewCurrentItemCardProps) {
  return (
    <section className="rounded-lg border border-[var(--border)] bg-white p-6">
      <ReviewAnswerCard
        basicCardFields={basicCardFields}
        isAnswerRevealed={isAnswerRevealed}
        onRevealAnswer={onRevealAnswer}
      />
    </section>
  );
}

import type { BasicReviewCardFields, ReviewQueueItem } from '@features/reviews';
import ReviewAnswerCard from './ReviewAnswerCard';
import ReviewCurrentItemHeader from './ReviewCurrentItemHeader';

interface ReviewCurrentItemCardProps {
  item: ReviewQueueItem;
  basicCardFields: BasicReviewCardFields;
  isAnswerRevealed: boolean;
  queueCount: number;
  onRevealAnswer: () => void;
}

export default function ReviewCurrentItemCard({
  item,
  basicCardFields,
  isAnswerRevealed,
  queueCount,
  onRevealAnswer,
}: ReviewCurrentItemCardProps) {
  return (
    <section className="rounded-lg border border-[var(--border)] bg-white p-6">
      <ReviewCurrentItemHeader item={item} queueCount={queueCount} />
      <ReviewAnswerCard
        basicCardFields={basicCardFields}
        isAnswerRevealed={isAnswerRevealed}
        onRevealAnswer={onRevealAnswer}
      />
    </section>
  );
}

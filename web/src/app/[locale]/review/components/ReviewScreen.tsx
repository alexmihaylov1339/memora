import { ErrorMessage, PageLoader } from '@shared/components';
import { useReviewScreen } from '@features/reviews';
import ReviewCurrentItemCard from './ReviewCurrentItemCard';
import ReviewEmptyState from './ReviewEmptyState';
import ReviewGradeButtons from './ReviewGradeButtons';
import ReviewUnsupportedCard from './ReviewUnsupportedCard';

export default function ReviewScreen() {
  const {
    basicCardFields,
    currentItem,
    errorMessage,
    isAnswerRevealed,
    isLoading,
    queueCount,
    handleRevealAnswer,
  } = useReviewScreen();

  if (isLoading) {
    return <PageLoader />;
  }

  if (errorMessage) {
    return <ErrorMessage message={errorMessage} />;
  }

  if (!currentItem) {
    return <ReviewEmptyState />;
  }

  if (!basicCardFields) {
    return <ReviewUnsupportedCard item={currentItem} />;
  }

  return (
    <div className="space-y-6">
      <ReviewCurrentItemCard
        item={currentItem}
        basicCardFields={basicCardFields}
        isAnswerRevealed={isAnswerRevealed}
        queueCount={queueCount}
        onRevealAnswer={handleRevealAnswer}
      />

      <ReviewGradeButtons />
    </div>
  );
}

import { ErrorMessage, PageLoader } from '@shared/components';
import { useReviewScreen } from '@features/reviews';
import ReviewCurrentItemCard from './ReviewCurrentItemCard';
import ReviewEmptyState from './ReviewEmptyState';
import ReviewFeedbackBanner from './ReviewFeedbackBanner';
import ReviewGradeButtons from './ReviewGradeButtons';
import ReviewUnsupportedCard from './ReviewUnsupportedCard';

export default function ReviewScreen() {
  const {
    basicCardFields,
    currentItem,
    errorMessage,
    gradeErrorMessage,
    gradeResult,
    handleGrade,
    handleRefreshQueue,
    isGrading,
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
    if (gradeResult) {
      return (
        <ReviewEmptyState
          title="Review step complete"
          description="No next actionable item was returned. Refresh the queue to check for the next due review."
          actionLabel="Refresh Queue"
          onAction={handleRefreshQueue}
        />
      );
    }

    return <ReviewEmptyState />;
  }

  if (!basicCardFields) {
    return <ReviewUnsupportedCard item={currentItem} />;
  }

  return (
    <div className="space-y-6">
      {gradeResult && <ReviewFeedbackBanner result={gradeResult} />}

      <ReviewCurrentItemCard
        item={currentItem}
        basicCardFields={basicCardFields}
        isAnswerRevealed={isAnswerRevealed}
        queueCount={queueCount}
        onRevealAnswer={handleRevealAnswer}
      />

      <ReviewGradeButtons
        disabled={!isAnswerRevealed || isGrading}
        errorMessage={gradeErrorMessage}
        isLoading={isGrading}
        onGrade={handleGrade}
      />
    </div>
  );
}

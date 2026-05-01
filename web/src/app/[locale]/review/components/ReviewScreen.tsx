import { ErrorMessage, PageLoader } from '@shared/components';
import { useReviewScreen } from '@features/reviews';
import ReviewCurrentItemCard from './ReviewCurrentItemCard';
import ReviewEmptyState from './ReviewEmptyState';
import ReviewFeedbackBanner from './ReviewFeedbackBanner';
import ReviewGradeButtons from './ReviewGradeButtons';
import ReviewUnsupportedCard from './ReviewUnsupportedCard';

export default function ReviewScreen() {
  const {
    currentItem,
    errorMessage,
    gradeErrorMessage,
    gradeResult,
    handleGrade,
    handleRefreshQueue,
    isGrading,
    isAnswerRevealed,
    isLoading,
    reviewRenderer,
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

  if (!reviewRenderer || reviewRenderer.renderer === 'unsupported') {
    return (
      <ReviewUnsupportedCard
        item={currentItem}
        onRefreshQueue={handleRefreshQueue}
        reason={reviewRenderer?.reason ?? currentItem.reviewUnsupportedReason ?? undefined}
      />
    );
  }

  return (
    <div className="space-y-6">
      {gradeResult && <ReviewFeedbackBanner result={gradeResult} />}

      <ReviewCurrentItemCard
        reviewRenderer={reviewRenderer}
        isAnswerRevealed={isAnswerRevealed}
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

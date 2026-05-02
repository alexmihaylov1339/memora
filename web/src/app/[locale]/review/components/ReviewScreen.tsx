import { ErrorMessage, PageLoader } from '@shared/components';
import { useReviewScreen } from '@features/reviews';
import ReviewCurrentItemCard from './ReviewCurrentItemCard';
import ReviewEmptyState from './ReviewEmptyState';
import ReviewFeedbackBanner from './ReviewFeedbackBanner';
import ReviewGradeButtons from './ReviewGradeButtons';
import ReviewRetryGradeBanner from './ReviewRetryGradeBanner';
import ReviewUnsupportedCard from './ReviewUnsupportedCard';

interface ReviewScreenProps {
  deckId: string | null;
}

export default function ReviewScreen({ deckId }: ReviewScreenProps) {
  const {
    currentItem,
    errorMessage,
    failedGradeRetry,
    gradeErrorMessage,
    gradeResult,
    handleGrade,
    handleRefreshQueue,
    handleRetryFailedGrade,
    isGrading,
    isAnswerRevealed,
    isLoading,
    isRetryingFailedGrade,
    reviewRenderer,
    handleRevealAnswer,
  } = useReviewScreen(deckId);

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
          practiceDeckId={deckId}
          onAction={handleRefreshQueue}
        />
      );
    }

    return <ReviewEmptyState practiceDeckId={deckId} />;
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
      {failedGradeRetry && (
        <ReviewRetryGradeBanner
          cardId={failedGradeRetry.cardId}
          errorMessage={failedGradeRetry.errorMessage}
          grade={failedGradeRetry.grade}
          isRetrying={isRetryingFailedGrade}
          onRetry={handleRetryFailedGrade}
        />
      )}

      <ReviewCurrentItemCard
        reviewRenderer={reviewRenderer}
        isAnswerRevealed={isAnswerRevealed}
        onRevealAnswer={handleRevealAnswer}
      />

      <ReviewGradeButtons
        disabled={isGrading}
        errorMessage={gradeErrorMessage}
        isLoading={isGrading}
        onGrade={handleGrade}
      />
    </div>
  );
}

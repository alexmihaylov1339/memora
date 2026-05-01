import { usePracticeScreen } from '@features/reviews';
import { ErrorMessage, PageLoader } from '@shared/components';
import ReviewCurrentItemCard from '../../review/components/ReviewCurrentItemCard';
import PracticeEmptyState from './PracticeEmptyState';
import PracticeHeader from './PracticeHeader';
import PracticeNavigation from './PracticeNavigation';
import PracticeUnsupportedCard from './PracticeUnsupportedCard';

interface PracticeScreenProps {
  deckId: string | null;
}

export default function PracticeScreen({ deckId }: PracticeScreenProps) {
  const {
    currentItem,
    errorMessage,
    hasNextItem,
    hasPreviousItem,
    handleNextItem,
    handlePreviousItem,
    handleRevealAnswer,
    isAnswerRevealed,
    isLoading,
    positionLabel,
    reviewRenderer,
    totalCount,
  } = usePracticeScreen(deckId);

  if (isLoading) {
    return <PageLoader />;
  }

  if (errorMessage) {
    return <ErrorMessage message={errorMessage} />;
  }

  if (!currentItem) {
    return (
      <PracticeEmptyState
        description="This deck does not have any practice cards yet."
        title="Nothing to practice"
      />
    );
  }

  return (
    <div className="space-y-6">
      <PracticeHeader deckId={deckId} positionLabel={positionLabel} />

      {!reviewRenderer || reviewRenderer.renderer === 'unsupported' ? (
        <PracticeUnsupportedCard
          item={currentItem}
          reason={reviewRenderer?.reason ?? currentItem.reviewUnsupportedReason}
        />
      ) : (
        <ReviewCurrentItemCard
          isAnswerRevealed={isAnswerRevealed}
          onRevealAnswer={handleRevealAnswer}
          reviewRenderer={reviewRenderer}
        />
      )}

      <PracticeNavigation
        hasNextItem={hasNextItem}
        hasPreviousItem={hasPreviousItem}
        onNext={handleNextItem}
        onPrevious={handlePreviousItem}
        totalCount={totalCount}
      />
    </div>
  );
}

import {
  resolvePracticeRenderer,
  usePracticeScreen,
} from '@features/reviews';
import { ErrorMessage, PageLoader } from '@shared/components';
import PracticeEmptyState from './PracticeEmptyState';
import PracticeUnsupportedCard from './PracticeUnsupportedCard';
import KidsPracticeCard from './KidsPracticeCard';
import KidsPracticeHeader from './KidsPracticeHeader';
import KidsPracticeNavigation from './KidsPracticeNavigation';

interface KidsPracticeScreenProps {
  deckId: string | null;
}

export default function KidsPracticeScreen({
  deckId,
}: KidsPracticeScreenProps) {
  const {
    currentItem,
    errorMessage,
    hasNextItem,
    hasPreviousItem,
    handleNextItem,
    handlePreviousItem,
    isLoading,
    positionLabel,
  } = usePracticeScreen(deckId);
  const practiceRenderer = resolvePracticeRenderer(currentItem);

  if (isLoading) {
    return <PageLoader />;
  }

  if (errorMessage) {
    return <ErrorMessage message={errorMessage} />;
  }

  if (!currentItem) {
    return (
      <PracticeEmptyState
        description="This kids deck does not have any picture cards yet."
        title="Nothing to practice"
      />
    );
  }

  return (
    <div className="space-y-3 pb-4 sm:space-y-4 sm:pb-5">
      <KidsPracticeHeader positionLabel={positionLabel} />

      <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_18rem] lg:items-start">
        {!practiceRenderer || practiceRenderer.renderer === 'unsupported' ? (
          <PracticeUnsupportedCard
            item={currentItem}
            reason={
              practiceRenderer?.reason ?? currentItem.reviewUnsupportedReason
            }
          />
        ) : practiceRenderer.renderer === 'image_audio' ? (
          <KidsPracticeCard cardFields={practiceRenderer.imageAudioCardFields} />
        ) : (
          <PracticeUnsupportedCard
            item={currentItem}
            reason={currentItem.reviewUnsupportedReason}
          />
        )}

        <KidsPracticeNavigation
          hasNextItem={hasNextItem}
          hasPreviousItem={hasPreviousItem}
          onNext={handleNextItem}
          onPrevious={handlePreviousItem}
        />
      </div>
    </div>
  );
}

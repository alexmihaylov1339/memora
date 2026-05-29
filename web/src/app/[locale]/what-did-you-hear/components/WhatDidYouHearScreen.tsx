import { useWhatDidYouHearScreen } from '@features/reviews';
import { Button, ErrorMessage, PageLoader } from '@shared/components';
import WhatDidYouHearChoiceGrid from './WhatDidYouHearChoiceGrid';
import WhatDidYouHearEmptyState from './WhatDidYouHearEmptyState';
import WhatDidYouHearPrompt from './WhatDidYouHearPrompt';

interface WhatDidYouHearScreenProps {
  deckId: string | null;
}

export default function WhatDidYouHearScreen({
  deckId,
}: WhatDidYouHearScreenProps) {
  const {
    correctChoiceId,
    errorMessage,
    handleChoiceSelect,
    handleNextRound,
    isCorrectSubmitted,
    isLoading,
    isSubmittingResult,
    postCorrectState,
    readyRound,
    status,
    wrongChoiceId,
  } = useWhatDidYouHearScreen(deckId);

  if (isLoading) {
    return <PageLoader />;
  }

  if (errorMessage) {
    return <ErrorMessage message={errorMessage} />;
  }

  if (status === 'not_enough_eligible_cards') {
    return (
      <WhatDidYouHearEmptyState
        title="Not enough picture cards"
        description="Add at least 2 image-audio cards to this deck before starting."
      />
    );
  }

  if (status === 'no_due_target') {
    return (
      <WhatDidYouHearEmptyState
        title="Nothing due right now"
        description="This deck has listening cards, but none are due for review yet."
      />
    );
  }

  if (!readyRound) {
    return (
      <WhatDidYouHearEmptyState
        title="Choose a deck"
        description="Open this mode from an eligible deck to start."
      />
    );
  }

  const canAdvance = Boolean(postCorrectState?.nextRound);

  return (
    <div className="space-y-5 pb-8 sm:space-y-6">
      <header className="text-center">
        <p className="text-sm font-bold uppercase tracking-wide text-brand">
          What Did You Hear?
        </p>
        <h1 className="mt-2 text-3xl font-black text-slate-950 sm:text-5xl">
          Listen, then pick the picture
        </h1>
      </header>

      <WhatDidYouHearPrompt round={readyRound} />

      <WhatDidYouHearChoiceGrid
        choices={readyRound.choices}
        correctChoiceId={correctChoiceId}
        disabled={isCorrectSubmitted || isSubmittingResult}
        wrongChoiceId={wrongChoiceId}
        onChoiceSelect={handleChoiceSelect}
      />

      {postCorrectState && (
        <section className="rounded-[18px] border border-emerald-100 bg-emerald-50 p-4 text-center shadow-sm">
          <p className="text-xl font-black text-emerald-900">Nice listening.</p>
          <div data-reward-slot-state={postCorrectState.rewardSlotState} />
          <Button
            className="mt-4 min-h-12 rounded-full bg-emerald-600 px-8 py-3 text-base font-black text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={!canAdvance || isSubmittingResult}
            isLoading={isSubmittingResult}
            onClick={handleNextRound}
            type="button"
          >
            Next
          </Button>
        </section>
      )}
    </div>
  );
}

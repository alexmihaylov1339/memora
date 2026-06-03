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
    <div className="space-y-3 pb-4 sm:space-y-4 sm:pb-5">
      <header className="text-center">
        <p className="text-xs font-bold uppercase tracking-wide text-brand sm:text-sm">
          What Did You Hear?
        </p>
        {/* <h1 className="mt-1 text-2xl font-black text-slate-950 sm:text-4xl">
          Listen, then pick the picture
        </h1> */}
      </header>

      <WhatDidYouHearPrompt round={readyRound} />

      <WhatDidYouHearChoiceGrid
        choices={readyRound.choices}
        correctChoiceId={correctChoiceId}
        disabled={isCorrectSubmitted}
        wrongChoiceId={wrongChoiceId}
        onChoiceSelect={handleChoiceSelect}
      />

      {postCorrectState && (
        <section className="rounded-[16px] border border-emerald-100 bg-emerald-50 p-3 text-center shadow-sm">
          <p className="text-lg font-black text-emerald-900">Nice listening.</p>
          <div data-reward-slot-state={postCorrectState.rewardSlotState} />
          <Button
            className="mt-3 min-h-11 rounded-full bg-emerald-600 px-7 py-2.5 text-base font-black text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={!canAdvance}
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

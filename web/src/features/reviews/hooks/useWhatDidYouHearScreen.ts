import { useEffect, useMemo, useState } from 'react';

import type {
  WhatDidYouHearChoice,
  WhatDidYouHearReadyRound,
  WhatDidYouHearRoundResponse,
} from '../types';
import { buildNextWhatDidYouHearRound } from '../services/whatDidYouHearRoundBuilder';
import { useWhatDidYouHearRoundQuery } from './useReviewQueries';
import { playWhatDidYouHearFeedback } from './useWhatDidYouHearFeedback';

interface PostCorrectState {
  cardId: string;
  nextRound: WhatDidYouHearRoundResponse | null;
  rewardSlotState: 'available';
}

export function useWhatDidYouHearScreen(deckId: string | null) {
  const roundQuery = useWhatDidYouHearRoundQuery(deckId);
  const [roundResponse, setRoundResponse] =
    useState<WhatDidYouHearRoundResponse | null>(null);
  const [wrongAttemptCount, setWrongAttemptCount] = useState(0);
  const [wrongChoiceId, setWrongChoiceId] = useState<string | null>(null);
  const [correctChoiceId, setCorrectChoiceId] = useState<string | null>(null);
  const [postCorrectState, setPostCorrectState] =
    useState<PostCorrectState | null>(null);

  useEffect(() => {
    if (!roundQuery.result) {
      return;
    }

    setRoundResponse(roundQuery.result);
    resetRoundInteraction();
  }, [roundQuery.result]);

  useEffect(() => {
    if (!wrongChoiceId) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setWrongChoiceId(null);
    }, 700);

    return () => window.clearTimeout(timeoutId);
  }, [wrongChoiceId]);

  const readyRound =
    roundResponse?.status === 'ready' ? roundResponse.round : null;
  const errorMessage = deckId
    ? roundQuery.error?.message
    : 'Choose a deck to start What Did You Hear?.';
  const status = roundResponse?.status ?? null;
  const isCorrectSubmitted = Boolean(postCorrectState);

  const selectedChoice = useMemo(
    () =>
      readyRound?.choices.find((choice) => choice.id === correctChoiceId) ??
      null,
    [correctChoiceId, readyRound?.choices],
  );

  function resetRoundInteraction() {
    setWrongAttemptCount(0);
    setWrongChoiceId(null);
    setCorrectChoiceId(null);
    setPostCorrectState(null);
  }

  function handleChoiceSelect(choice: WhatDidYouHearChoice) {
    if (
      !deckId ||
      !readyRound ||
      choice.isDisabled ||
      isCorrectSubmitted
    ) {
      return;
    }

    if (!choice.isCorrect) {
      setWrongAttemptCount((count) => count + 1);
      setWrongChoiceId(choice.id);
      playWhatDidYouHearFeedback('wrong');
      return;
    }

    setCorrectChoiceId(choice.id);
    setPostCorrectState({
      cardId: choice.cardId ?? readyRound.targetCard.cardId,
      nextRound: buildNextWhatDidYouHearRound(
        readyRound,
        readyRound.targetCard.cardId,
      ),
      rewardSlotState: 'available',
    });
    playWhatDidYouHearFeedback('correct');
  }

  function handleNextRound() {
    if (!postCorrectState?.nextRound) {
      return;
    }

    setRoundResponse(postCorrectState.nextRound);
    resetRoundInteraction();
  }

  return {
    correctChoiceId,
    errorMessage,
    isCorrectSubmitted,
    isLoading: roundQuery.isLoading,
    postCorrectState,
    readyRound: readyRound as WhatDidYouHearReadyRound | null,
    selectedChoice,
    status,
    wrongAttemptCount,
    wrongChoiceId,
    handleChoiceSelect,
    handleNextRound,
  };
}

import { act, renderHook, waitFor } from '@testing-library/react';

import type {
  SubmitWhatDidYouHearResponse,
  WhatDidYouHearReadyRound,
  WhatDidYouHearRoundResponse,
} from '../types';
import { useWhatDidYouHearScreen } from './useWhatDidYouHearScreen';

const mockUseWhatDidYouHearRoundQuery = jest.fn();
const mockUseSubmitWhatDidYouHearResultMutation = jest.fn();
const mockPlayWhatDidYouHearFeedback = jest.fn();

interface SubmitCallbacks {
  onSuccess?: (data: SubmitWhatDidYouHearResponse) => void;
}

jest.mock('./useReviewQueries', () => ({
  useWhatDidYouHearRoundQuery: (...args: unknown[]) =>
    mockUseWhatDidYouHearRoundQuery(...args),
}));

jest.mock('./useReviewMutations', () => ({
  useSubmitWhatDidYouHearResultMutation: (...args: unknown[]) =>
    mockUseSubmitWhatDidYouHearResultMutation(...args),
}));

jest.mock('./useWhatDidYouHearFeedback', () => ({
  playWhatDidYouHearFeedback: (...args: unknown[]) =>
    mockPlayWhatDidYouHearFeedback(...args),
}));

function buildAsset(path: string) {
  return {
    path,
    mimeType: path.endsWith('.mp3') ? 'audio/mpeg' : 'image/jpeg',
    size: 100,
    url: `https://assets.test/${path}`,
  };
}

function buildReadyRound(): WhatDidYouHearReadyRound {
  return {
    deckId: 'deck-1',
    choiceCount: 4,
    eligibleCardCount: 2,
    targetCard: {
      cardId: 'card-1',
      label: 'Car',
      audioAsset: buildAsset('kids-audio/car.mp3'),
      quizTags: [],
    },
    reviewContext: {
      cardId: 'card-1',
      deckId: 'deck-1',
      chunkId: 'chunk-1',
      chunkTitle: 'vehicles',
      chunkPosition: 0,
      positionInChunk: 0,
      due: '2026-04-26T10:00:00.000Z',
      kind: 'image_audio',
      fields: { label: 'Car' },
      isReviewSupported: false,
      reviewUnsupportedReason: 'kind_not_review_enabled',
      consecutiveSuccessCount: 0,
    },
    choices: [
      {
        id: 'choice-card-1',
        cardId: 'card-1',
        imageAsset: buildAsset('kids-images/car.jpg'),
        isCorrect: true,
        isDisabled: false,
        label: null,
      },
      {
        id: 'choice-card-2',
        cardId: 'card-2',
        imageAsset: buildAsset('kids-images/bus.jpg'),
        isCorrect: false,
        isDisabled: false,
        label: null,
      },
    ],
  };
}

function buildSubmitResponse(
  nextQuizRound: WhatDidYouHearRoundResponse,
): SubmitWhatDidYouHearResponse {
  return {
    accepted: true,
    cardId: 'card-1',
    wrongAttemptCount: 1,
    derivedReviewGrade: 'hard',
    nextQuizRound,
    review: {
      cardId: 'card-1',
      grade: 'hard',
      wasSuccessful: false,
      advanced: false,
      reset: true,
      previousConsecutiveSuccessCount: 0,
      consecutiveSuccessCount: 0,
      due: '2026-04-26T14:00:00.000Z',
      intervalHours: 8,
      nextActionableItem: null,
      chunk: {
        chunkId: 'chunk-1',
        deckId: 'deck-1',
        title: 'vehicles',
        position: 0,
        due: '2026-04-26T14:00:00.000Z',
        isDue: false,
        consecutiveSuccessCount: 0,
        requiredConsecutiveSuccesses: 20,
        hasMastery: false,
        totalCards: 1,
        currentCard: null,
        lastGrade: 'hard',
      },
    },
  };
}

describe('useWhatDidYouHearScreen', () => {
  const submit = jest.fn();
  const reset = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseWhatDidYouHearRoundQuery.mockReturnValue({
      result: { status: 'ready', round: buildReadyRound() },
      isLoading: false,
      error: undefined,
    });
    mockUseSubmitWhatDidYouHearResultMutation.mockReturnValue({
      error: undefined,
      isLoading: false,
      reset,
      submit,
    });
  });

  it('keeps wrong-answer rounds stable and records wrong attempts', async () => {
    const { result } = renderHook(() => useWhatDidYouHearScreen('deck-1'));

    await waitFor(() => {
      expect(result.current.readyRound?.targetCard.cardId).toBe('card-1');
    });

    act(() => {
      result.current.handleChoiceSelect(result.current.readyRound!.choices[1]);
    });

    expect(result.current.readyRound?.targetCard.cardId).toBe('card-1');
    expect(result.current.wrongAttemptCount).toBe(1);
    expect(result.current.wrongChoiceId).toBe('choice-card-2');
    expect(mockPlayWhatDidYouHearFeedback).toHaveBeenCalledWith('wrong');
    expect(submit).not.toHaveBeenCalled();
  });

  it('submits a correct answer with accumulated wrong attempts and exposes the reward slot state', async () => {
    const nextQuizRound: WhatDidYouHearRoundResponse = {
      status: 'no_due_target',
      eligibleCardCount: 2,
      choiceCount: 4,
    };
    submit.mockImplementation(
      (_input: unknown, callbacks?: SubmitCallbacks) => {
        callbacks?.onSuccess?.(buildSubmitResponse(nextQuizRound));
      },
    );

    const { result } = renderHook(() => useWhatDidYouHearScreen('deck-1'));

    await waitFor(() => {
      expect(result.current.readyRound?.targetCard.cardId).toBe('card-1');
    });

    act(() => {
      result.current.handleChoiceSelect(result.current.readyRound!.choices[1]);
    });

    await waitFor(() => {
      expect(result.current.wrongAttemptCount).toBe(1);
    });

    act(() => {
      result.current.handleChoiceSelect(result.current.readyRound!.choices[0]);
    });

    expect(submit).toHaveBeenCalledWith(
      {
        cardId: 'card-1',
        deckId: 'deck-1',
        wrongAttemptCount: 1,
      },
      expect.objectContaining({
        onSuccess: expect.any(Function),
      }),
    );
    expect(result.current.correctChoiceId).toBe('choice-card-1');
    expect(result.current.postCorrectState).toEqual({
      cardId: 'card-1',
      nextRound: nextQuizRound,
      rewardSlotState: 'available',
    });
    expect(mockPlayWhatDidYouHearFeedback).toHaveBeenCalledWith('correct');
  });
});

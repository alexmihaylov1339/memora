import { act, renderHook, waitFor } from '@testing-library/react';

import type { WhatDidYouHearReadyRound } from '../types';
import { useWhatDidYouHearScreen } from './useWhatDidYouHearScreen';

const mockUseWhatDidYouHearRoundQuery = jest.fn();
const mockPlayWhatDidYouHearFeedback = jest.fn();

jest.mock('./useReviewQueries', () => ({
  useWhatDidYouHearRoundQuery: (...args: unknown[]) =>
    mockUseWhatDidYouHearRoundQuery(...args),
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
    sessionCards: [
      {
        cardId: 'card-1',
        label: 'Car',
        imageAsset: buildAsset('kids-images/car.jpg'),
        audioAsset: buildAsset('kids-audio/car.mp3'),
        quizTags: [],
      },
      {
        cardId: 'card-2',
        label: 'Bus',
        imageAsset: buildAsset('kids-images/bus.jpg'),
        audioAsset: buildAsset('kids-audio/bus.mp3'),
        quizTags: [],
      },
    ],
    targetCard: {
      cardId: 'card-1',
      label: 'Car',
      audioAsset: buildAsset('kids-audio/car.mp3'),
      quizTags: [],
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

describe('useWhatDidYouHearScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseWhatDidYouHearRoundQuery.mockReturnValue({
      result: { status: 'ready', round: buildReadyRound() },
      isLoading: false,
      error: undefined,
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
  });

  it('builds the next round locally after a correct answer and exposes the reward slot state', async () => {
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

    expect(result.current.correctChoiceId).toBe('choice-card-1');
    expect(result.current.postCorrectState).toEqual(
      expect.objectContaining({
        cardId: 'card-1',
        rewardSlotState: 'available',
      }),
    );
    expect(result.current.postCorrectState?.nextRound).toEqual(
      expect.objectContaining({
        status: 'ready',
        round: expect.objectContaining({
          targetCard: expect.objectContaining({ cardId: 'card-2' }),
        }),
      }),
    );
    expect(mockPlayWhatDidYouHearFeedback).toHaveBeenCalledWith('correct');
  });

  it('advances to the prebuilt local round without waiting on network state', async () => {
    const { result } = renderHook(() => useWhatDidYouHearScreen('deck-1'));

    await waitFor(() => {
      expect(result.current.readyRound?.targetCard.cardId).toBe('card-1');
    });

    act(() => {
      result.current.handleChoiceSelect(result.current.readyRound!.choices[0]);
    });

    act(() => {
      result.current.handleNextRound();
    });

    expect(result.current.readyRound?.targetCard.cardId).toBe('card-2');
    expect(result.current.postCorrectState).toBeNull();
  });
});

import { act, renderHook } from '@testing-library/react';
import { trackAnalyticsEvent } from '@shared/analytics';
import { REVIEW_QUEUE_STATES, REVIEW_UI_EVENTS } from '../review-observability';
import { useReviewScreen } from './useReviewScreen';

const mockUseReviewQueueQuery = jest.fn();
const mockUseGradeReviewMutation = jest.fn();
const mockTrackAnalyticsEvent = trackAnalyticsEvent as jest.MockedFunction<
  typeof trackAnalyticsEvent
>;

jest.mock('@shared/analytics', () => ({
  trackAnalyticsEvent: jest.fn(),
}));

jest.mock('./useReviewQueries', () => ({
  useReviewQueueQuery: (...args: unknown[]) => mockUseReviewQueueQuery(...args),
}));

jest.mock('./useReviewMutations', () => ({
  useGradeReviewMutation: (...args: unknown[]) =>
    mockUseGradeReviewMutation(...args),
}));

describe('useReviewScreen observability', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseGradeReviewMutation.mockReturnValue({
      fetch: jest.fn(),
      isLoading: false,
      error: undefined,
    });
  });

  it('emits empty queue state once and avoids duplicate on rerender', () => {
    mockUseReviewQueueQuery.mockReturnValue({
      result: { items: [] },
      isLoading: false,
      error: undefined,
      refetch: jest.fn(),
    });

    const { rerender } = renderHook(() => useReviewScreen('deck-1'));

    expect(mockTrackAnalyticsEvent).toHaveBeenCalledWith(
      REVIEW_UI_EVENTS.queueStateChanged,
      expect.objectContaining({
        state: REVIEW_QUEUE_STATES.empty,
      }),
    );

    const queueStateCallsAfterInitialRender =
      mockTrackAnalyticsEvent.mock.calls.filter(
        ([event]) => event === REVIEW_UI_EVENTS.queueStateChanged,
      ).length;

    rerender();

    const queueStateCallsAfterRerender = mockTrackAnalyticsEvent.mock.calls.filter(
      ([event]) => event === REVIEW_UI_EVENTS.queueStateChanged,
    ).length;
    expect(queueStateCallsAfterRerender).toBe(queueStateCallsAfterInitialRender);
  });

  it('emits unsupported seen once and avoids duplicate on rerender', () => {
    mockUseReviewQueueQuery.mockReturnValue({
      result: {
        items: [
          {
            cardId: 'card-1',
            deckId: 'deck-1',
            chunkId: 'chunk-1',
            chunkTitle: 'spielen',
            chunkPosition: 0,
            positionInChunk: 0,
            due: '2026-04-26T10:00:00.000Z',
            kind: 'cloze_text',
            fields: { text: 'Ich {{c1::spiele}}.', answer: 'spiele' },
            isReviewSupported: false,
            reviewUnsupportedReason: 'kind_not_review_enabled',
            consecutiveSuccessCount: 0,
          },
        ],
      },
      isLoading: false,
      error: undefined,
      refetch: jest.fn(),
    });

    const { rerender } = renderHook(() => useReviewScreen('deck-1'));

    const unsupportedCallsAfterInitialRender =
      mockTrackAnalyticsEvent.mock.calls.filter(
        ([event]) => event === REVIEW_UI_EVENTS.unsupportedSeen,
      ).length;
    expect(unsupportedCallsAfterInitialRender).toBe(1);

    rerender();

    const unsupportedCallsAfterRerender = mockTrackAnalyticsEvent.mock.calls.filter(
      ([event]) => event === REVIEW_UI_EVENTS.unsupportedSeen,
    ).length;
    expect(unsupportedCallsAfterRerender).toBe(1);
  });

  it('emits grade clicked and complete queue state after successful grading', async () => {
    const fetchMock = jest.fn().mockResolvedValue({
      cardId: 'card-1',
      grade: 'good',
      wasSuccessful: true,
      advanced: true,
      reset: false,
      previousConsecutiveSuccessCount: 0,
      consecutiveSuccessCount: 1,
      due: '2026-04-26T14:00:00.000Z',
      intervalHours: 8,
      chunk: {
        chunkId: 'chunk-1',
        deckId: 'deck-1',
        title: 'spielen',
        position: 0,
        due: '2026-04-26T14:00:00.000Z',
        isDue: false,
        consecutiveSuccessCount: 1,
        requiredConsecutiveSuccesses: 20,
        hasMastery: false,
        totalCards: 1,
        currentCard: null,
        lastGrade: 'good',
      },
      nextActionableItem: null,
    });

    mockUseGradeReviewMutation.mockReturnValue({
      fetch: fetchMock,
      isLoading: false,
      error: undefined,
    });
    mockUseReviewQueueQuery.mockReturnValue({
      result: {
        items: [
          {
            cardId: 'card-1',
            deckId: 'deck-1',
            chunkId: 'chunk-1',
            chunkTitle: 'spielen',
            chunkPosition: 0,
            positionInChunk: 0,
            due: '2026-04-26T10:00:00.000Z',
            kind: 'basic',
            fields: { front: 'spielen', back: 'to play' },
            isReviewSupported: true,
            reviewUnsupportedReason: null,
            consecutiveSuccessCount: 0,
          },
        ],
      },
      isLoading: false,
      error: undefined,
      refetch: jest.fn(),
    });

    const { result } = renderHook(() => useReviewScreen('deck-1'));

    await act(async () => {
      await result.current.handleGrade('good');
    });

    expect(mockTrackAnalyticsEvent).toHaveBeenCalledWith(
      REVIEW_UI_EVENTS.gradeClicked,
      expect.objectContaining({
        cardId: 'card-1',
        kind: 'basic',
        grade: 'good',
      }),
    );
    expect(mockTrackAnalyticsEvent).toHaveBeenCalledWith(
      REVIEW_UI_EVENTS.queueStateChanged,
      expect.objectContaining({
        state: REVIEW_QUEUE_STATES.complete,
      }),
    );
    expect(fetchMock).toHaveBeenCalledWith({
      cardId: 'card-1',
      deckId: 'deck-1',
      grade: 'good',
    });
  });

  it('moves to the next queued card when the grade response repeats the current card', async () => {
    const fetchMock = jest.fn().mockResolvedValue({
      cardId: 'card-1',
      grade: 'hard',
      wasSuccessful: false,
      advanced: false,
      reset: true,
      previousConsecutiveSuccessCount: 0,
      consecutiveSuccessCount: 0,
      due: '2026-04-26T10:00:00.000Z',
      intervalHours: 0,
      chunk: {
        chunkId: 'chunk-1',
        deckId: 'deck-1',
        title: 'spielen',
        position: 0,
        due: '2026-04-26T10:00:00.000Z',
        isDue: true,
        consecutiveSuccessCount: 0,
        requiredConsecutiveSuccesses: 20,
        hasMastery: false,
        totalCards: 2,
        currentCard: { cardId: 'card-1', sequenceIndex: 0 },
        lastGrade: 'hard',
      },
      nextActionableItem: {
        cardId: 'card-1',
        deckId: 'deck-1',
        chunkId: 'chunk-1',
        chunkTitle: 'spielen',
        chunkPosition: 0,
        positionInChunk: 0,
        due: '2026-04-26T10:00:00.000Z',
        kind: 'basic',
        fields: { front: 'spielen', back: 'to play' },
        isReviewSupported: true,
        reviewUnsupportedReason: null,
        consecutiveSuccessCount: 0,
      },
    });

    mockUseGradeReviewMutation.mockReturnValue({
      fetch: fetchMock,
      isLoading: false,
      error: undefined,
    });
    mockUseReviewQueueQuery.mockReturnValue({
      result: {
        items: [
          {
            cardId: 'card-1',
            deckId: 'deck-1',
            chunkId: 'chunk-1',
            chunkTitle: 'spielen',
            chunkPosition: 0,
            positionInChunk: 0,
            due: '2026-04-26T10:00:00.000Z',
            kind: 'basic',
            fields: { front: 'spielen', back: 'to play' },
            isReviewSupported: true,
            reviewUnsupportedReason: null,
            consecutiveSuccessCount: 0,
          },
          {
            cardId: 'card-2',
            deckId: 'deck-1',
            chunkId: 'chunk-1',
            chunkTitle: 'spielen',
            chunkPosition: 0,
            positionInChunk: 1,
            due: '2026-04-26T10:00:00.000Z',
            kind: 'basic',
            fields: { front: 'mache', back: 'make' },
            isReviewSupported: true,
            reviewUnsupportedReason: null,
            consecutiveSuccessCount: 0,
          },
        ],
      },
      isLoading: false,
      error: undefined,
      refetch: jest.fn(),
    });

    const { result } = renderHook(() => useReviewScreen('deck-1'));

    await act(async () => {
      await result.current.handleGrade('hard');
    });

    expect(result.current.currentItem?.cardId).toBe('card-2');
  });
});

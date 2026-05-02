import { act, renderHook } from '@testing-library/react';
import { trackAnalyticsEvent } from '@shared/analytics';
import { REVIEW_QUEUE_STATES, REVIEW_UI_EVENTS } from '../review-observability';
import type {
  GradeReviewDto,
  GradeReviewResponse,
  ReviewCardIdParams,
  ReviewQueueItem,
} from '../types';
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

function buildQueueItem(
  cardId: string,
  overrides: Partial<ReviewQueueItem> = {},
): ReviewQueueItem {
  return {
    cardId,
    deckId: 'deck-1',
    chunkId: 'chunk-1',
    chunkTitle: 'spielen',
    chunkPosition: 0,
    positionInChunk: 0,
    due: '2026-04-26T10:00:00.000Z',
    kind: 'basic',
    fields: { front: cardId, back: cardId },
    isReviewSupported: true,
    reviewUnsupportedReason: null,
    consecutiveSuccessCount: 0,
    ...overrides,
  };
}

function buildGradeResponse(
  overrides: Partial<GradeReviewResponse> = {},
): GradeReviewResponse {
  return {
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
    ...overrides,
  };
}

function createDeferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (reason?: unknown) => void;
  const promise = new Promise<T>((promiseResolve, promiseReject) => {
    resolve = promiseResolve;
    reject = promiseReject;
  });

  return { promise, resolve, reject };
}

type GradeMutationInput = ReviewCardIdParams & GradeReviewDto;

interface GradeMutationCallbacks {
  onError?: (error: Error) => void;
  onSuccess?: (data: GradeReviewResponse) => void;
}

function createGradeMutationMock(
  responses: Array<() => Promise<GradeReviewResponse>>,
) {
  return jest.fn(
    (input: GradeMutationInput, callbacks?: GradeMutationCallbacks) => {
      const response = responses.shift()?.();

      if (!response) {
        return;
      }

      void response.then(callbacks?.onSuccess, callbacks?.onError);
    },
  );
}

describe('useReviewScreen observability', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseGradeReviewMutation.mockReturnValue({
      grade: jest.fn(),
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
    const gradeMock = createGradeMutationMock([
      () => Promise.resolve({
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
      }),
    ]);

    mockUseGradeReviewMutation.mockReturnValue({
      grade: gradeMock,
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
      result.current.handleGrade('good');
      await Promise.resolve();
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
    expect(gradeMock).toHaveBeenCalledWith(
      {
        cardId: 'card-1',
        deckId: 'deck-1',
        grade: 'good',
      },
      expect.any(Object),
    );
  });

  it('moves to the next queued card when the grade response repeats the current card', async () => {
    const gradeMock = createGradeMutationMock([
      () => Promise.resolve({
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
      }),
    ]);

    mockUseGradeReviewMutation.mockReturnValue({
      grade: gradeMock,
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
      result.current.handleGrade('hard');
      await Promise.resolve();
    });

    expect(result.current.currentItem?.cardId).toBe('card-2');
  });

  it('optimistically advances to the next local queue item before grade persistence resolves', async () => {
    const deferredGrade = createDeferred<GradeReviewResponse>();
    const gradeMock = createGradeMutationMock([() => deferredGrade.promise]);

    mockUseGradeReviewMutation.mockReturnValue({
      grade: gradeMock,
      isLoading: false,
      error: undefined,
    });
    mockUseReviewQueueQuery.mockReturnValue({
      result: {
        items: [buildQueueItem('card-1'), buildQueueItem('card-2')],
      },
      isLoading: false,
      error: undefined,
      refetch: jest.fn(),
    });

    const { result } = renderHook(() => useReviewScreen('deck-1'));

    await act(async () => {
      result.current.handleGrade('good');
      await Promise.resolve();
    });

    expect(result.current.currentItem?.cardId).toBe('card-2');

    deferredGrade.resolve(buildGradeResponse());
    await act(async () => {
      await deferredGrade.promise;
    });
  });

  it('keeps the current card visible while waiting when no local next item exists', async () => {
    const deferredGrade = createDeferred<GradeReviewResponse>();
    const gradeMock = createGradeMutationMock([() => deferredGrade.promise]);

    mockUseGradeReviewMutation.mockReturnValue({
      grade: gradeMock,
      isLoading: false,
      error: undefined,
    });
    mockUseReviewQueueQuery.mockReturnValue({
      result: {
        items: [buildQueueItem('card-1')],
      },
      isLoading: false,
      error: undefined,
      refetch: jest.fn(),
    });

    const { result } = renderHook(() => useReviewScreen('deck-1'));

    await act(async () => {
      result.current.handleGrade('good');
      await Promise.resolve();
    });

    expect(result.current.currentItem?.cardId).toBe('card-1');

    deferredGrade.resolve(
      buildGradeResponse({ nextActionableItem: buildQueueItem('card-2') }),
    );
    await act(async () => {
      await deferredGrade.promise;
    });

    expect(result.current.currentItem?.cardId).toBe('card-2');
  });

  it('reconciles a different server next item without jumping away from the visible optimistic card', async () => {
    const gradeMock = createGradeMutationMock([
      () => Promise.resolve(
        buildGradeResponse({ nextActionableItem: buildQueueItem('card-3') }),
      ),
    ]);

    mockUseGradeReviewMutation.mockReturnValue({
      grade: gradeMock,
      isLoading: false,
      error: undefined,
    });
    mockUseReviewQueueQuery.mockReturnValue({
      result: {
        items: [buildQueueItem('card-1'), buildQueueItem('card-2')],
      },
      isLoading: false,
      error: undefined,
      refetch: jest.fn(),
    });

    const { result } = renderHook(() => useReviewScreen('deck-1'));

    await act(async () => {
      result.current.handleGrade('good');
      await Promise.resolve();
    });

    expect(result.current.currentItem?.cardId).toBe('card-2');
    expect(result.current.queueCount).toBe(2);
  });

  it('keeps the next card visible and exposes retry when optimistic grade persistence fails', async () => {
    const gradeMock = createGradeMutationMock([
      () => Promise.reject(new Error('Network failed')),
    ]);

    mockUseGradeReviewMutation.mockReturnValue({
      grade: gradeMock,
      isLoading: false,
      error: undefined,
    });
    mockUseReviewQueueQuery.mockReturnValue({
      result: {
        items: [buildQueueItem('card-1'), buildQueueItem('card-2')],
      },
      isLoading: false,
      error: undefined,
      refetch: jest.fn(),
    });

    const { result } = renderHook(() => useReviewScreen('deck-1'));

    await act(async () => {
      result.current.handleGrade('good');
      await Promise.resolve();
    });

    expect(result.current.currentItem?.cardId).toBe('card-2');
    expect(result.current.failedGradeRetry).toEqual({
      cardId: 'card-1',
      errorMessage: 'Network failed',
      grade: 'good',
    });
  });

  it('clears failed grade retry after retry succeeds', async () => {
    const gradeMock = createGradeMutationMock([
      () => Promise.reject(new Error('Network failed')),
      () => Promise.resolve(
        buildGradeResponse({ nextActionableItem: buildQueueItem('card-3') }),
      ),
    ]);

    mockUseGradeReviewMutation.mockReturnValue({
      grade: gradeMock,
      isLoading: false,
      error: undefined,
    });
    mockUseReviewQueueQuery.mockReturnValue({
      result: {
        items: [buildQueueItem('card-1'), buildQueueItem('card-2')],
      },
      isLoading: false,
      error: undefined,
      refetch: jest.fn(),
    });

    const { result } = renderHook(() => useReviewScreen('deck-1'));

    await act(async () => {
      result.current.handleGrade('hard');
      await Promise.resolve();
    });
    await act(async () => {
      await result.current.handleRetryFailedGrade();
      await Promise.resolve();
    });

    expect(gradeMock).toHaveBeenLastCalledWith(
      {
        cardId: 'card-1',
        deckId: 'deck-1',
        grade: 'hard',
      },
      expect.any(Object),
    );
    expect(result.current.failedGradeRetry).toBeNull();
    expect(result.current.gradeResult?.cardId).toBe('card-1');
    expect(result.current.currentItem?.cardId).toBe('card-2');
  });

  it('keeps failed grade retry visible with a new error when retry fails again', async () => {
    const gradeMock = createGradeMutationMock([
      () => Promise.reject(new Error('Network failed')),
      () => Promise.reject(new Error('Retry failed')),
    ]);

    mockUseGradeReviewMutation.mockReturnValue({
      grade: gradeMock,
      isLoading: false,
      error: undefined,
    });
    mockUseReviewQueueQuery.mockReturnValue({
      result: {
        items: [buildQueueItem('card-1'), buildQueueItem('card-2')],
      },
      isLoading: false,
      error: undefined,
      refetch: jest.fn(),
    });

    const { result } = renderHook(() => useReviewScreen('deck-1'));

    await act(async () => {
      result.current.handleGrade('again');
      await Promise.resolve();
    });
    await act(async () => {
      await result.current.handleRetryFailedGrade();
      await Promise.resolve();
    });

    expect(result.current.failedGradeRetry).toEqual({
      cardId: 'card-1',
      errorMessage: 'Retry failed',
      grade: 'again',
    });
    expect(result.current.currentItem?.cardId).toBe('card-2');
  });

  it('prevents duplicate retry submissions while retry is in flight', async () => {
    const deferredRetry = createDeferred<GradeReviewResponse>();
    const gradeMock = createGradeMutationMock([
      () => Promise.reject(new Error('Network failed')),
      () => deferredRetry.promise,
    ]);

    mockUseGradeReviewMutation.mockReturnValue({
      grade: gradeMock,
      isLoading: false,
      error: undefined,
    });
    mockUseReviewQueueQuery.mockReturnValue({
      result: {
        items: [buildQueueItem('card-1'), buildQueueItem('card-2')],
      },
      isLoading: false,
      error: undefined,
      refetch: jest.fn(),
    });

    const { result } = renderHook(() => useReviewScreen('deck-1'));

    await act(async () => {
      result.current.handleGrade('good');
      await Promise.resolve();
    });
    await act(async () => {
      void result.current.handleRetryFailedGrade();
      void result.current.handleRetryFailedGrade();
      await Promise.resolve();
    });

    expect(gradeMock).toHaveBeenCalledTimes(2);

    deferredRetry.resolve(buildGradeResponse());
    await act(async () => {
      await deferredRetry.promise;
    });
  });
});

import { render, screen } from '@testing-library/react';
import { useReviewScreen } from '@features/reviews';
import { REVIEW_UNSUPPORTED_REASONS } from '@features/reviews/types';
import ReviewScreen from './ReviewScreen';

jest.mock('@features/reviews', () => ({
  useReviewScreen: jest.fn(),
}));

jest.mock('@shared/components', () => ({
  ErrorMessage: ({ message }: { message: string }) => (
    <div data-testid="error-message">{message}</div>
  ),
  PageLoader: () => <div data-testid="page-loader">loading</div>,
}));

jest.mock('./ReviewCurrentItemCard', () => {
  function MockReviewCurrentItemCard() {
    return <div data-testid="review-current-item-card">current</div>;
  }

  return MockReviewCurrentItemCard;
});
jest.mock('./ReviewEmptyState', () => {
  function MockReviewEmptyState(props: { title?: string }) {
    return (
      <div data-testid="review-empty-state">{props.title ?? 'empty-default'}</div>
    );
  }

  return MockReviewEmptyState;
});
jest.mock('./ReviewFeedbackBanner', () => {
  function MockReviewFeedbackBanner() {
    return <div data-testid="review-feedback-banner">feedback</div>;
  }

  return MockReviewFeedbackBanner;
});
jest.mock('./ReviewGradeButtons', () => {
  function MockReviewGradeButtons({ disabled }: { disabled: boolean }) {
    return (
      <div data-disabled={String(disabled)} data-testid="review-grade-buttons">
        grades
      </div>
    );
  }

  return MockReviewGradeButtons;
});
jest.mock(
  './ReviewUnsupportedCard',
  () => {
    function MockReviewUnsupportedCard({ reason }: { reason?: string }) {
      return (
      <div data-testid="review-unsupported-card">
        {reason ?? 'no-reason'}
      </div>
      );
    }

    return MockReviewUnsupportedCard;
  },
);

const mockedUseReviewScreen = useReviewScreen as jest.MockedFunction<
  typeof useReviewScreen
>;

function buildHookResult(
  overrides: Partial<ReturnType<typeof useReviewScreen>> = {},
): ReturnType<typeof useReviewScreen> {
  return {
    currentItem: null,
    deckId: 'deck-1',
    errorMessage: undefined,
    gradeErrorMessage: undefined,
    gradeResult: null,
    reviewRenderer: null,
    isGrading: false,
    isAnswerRevealed: false,
    isLoading: false,
    queueCount: 0,
    handleGrade: jest.fn(),
    handleRevealAnswer: jest.fn(),
    handleRefreshQueue: jest.fn(),
    ...overrides,
  };
}

describe('ReviewScreen', () => {
  beforeEach(() => {
    mockedUseReviewScreen.mockReset();
  });

  it('renders loader while queue is loading', () => {
    mockedUseReviewScreen.mockReturnValue(buildHookResult({ isLoading: true }));

    render(<ReviewScreen deckId="deck-1" />);

    expect(screen.getByTestId('page-loader')).toBeInTheDocument();
  });

  it('renders error state when queue request fails', () => {
    mockedUseReviewScreen.mockReturnValue(
      buildHookResult({ errorMessage: 'Queue failed' }),
    );

    render(<ReviewScreen deckId="deck-1" />);

    expect(screen.getByTestId('error-message')).toHaveTextContent('Queue failed');
  });

  it('renders complete empty state when no current item after grading', () => {
    mockedUseReviewScreen.mockReturnValue(
      buildHookResult({
        currentItem: null,
        gradeResult: {
          cardId: 'card-1',
          grade: 'good',
          wasSuccessful: true,
          advanced: true,
          reset: false,
          previousConsecutiveSuccessCount: 0,
          consecutiveSuccessCount: 1,
          due: '2026-04-26T10:00:00.000Z',
          intervalHours: 8,
          chunk: {
            chunkId: 'chunk-1',
            deckId: 'deck-1',
            title: 'spielen',
            position: 0,
            due: '2026-04-26T10:00:00.000Z',
            isDue: false,
            consecutiveSuccessCount: 1,
            requiredConsecutiveSuccesses: 20,
            hasMastery: false,
            totalCards: 2,
            currentCard: null,
            lastGrade: 'good',
          },
          nextActionableItem: null,
        },
      }),
    );

    render(<ReviewScreen deckId="deck-1" />);

    expect(screen.getByTestId('review-empty-state')).toHaveTextContent(
      'Review step complete',
    );
  });

  it('renders unsupported card with explicit unsupported reason', () => {
    mockedUseReviewScreen.mockReturnValue(
      buildHookResult({
        currentItem: {
          cardId: 'card-2',
          deckId: 'deck-1',
          chunkId: 'chunk-1',
          chunkTitle: 'spielen',
          chunkPosition: 0,
          positionInChunk: 1,
          due: '2026-04-26T10:00:00.000Z',
          kind: 'cloze_text',
          fields: {
            text: 'Ich {{c1::spiele}} gern Tennis.',
            answer: 'spiele',
          },
          isReviewSupported: false,
          reviewUnsupportedReason:
            REVIEW_UNSUPPORTED_REASONS.kindNotReviewEnabled,
          consecutiveSuccessCount: 1,
        },
        reviewRenderer: {
          renderer: 'unsupported',
          reason: REVIEW_UNSUPPORTED_REASONS.kindNotReviewEnabled,
        },
      }),
    );

    render(<ReviewScreen deckId="deck-1" />);

    expect(screen.getByTestId('review-unsupported-card')).toHaveTextContent(
      REVIEW_UNSUPPORTED_REASONS.kindNotReviewEnabled,
    );
  });

  it('falls back to item reason when renderer resolution is malformed/null', () => {
    mockedUseReviewScreen.mockReturnValue(
      buildHookResult({
        currentItem: {
          cardId: 'card-3',
          deckId: 'deck-1',
          chunkId: 'chunk-1',
          chunkTitle: 'spielen',
          chunkPosition: 0,
          positionInChunk: 0,
          due: '2026-04-26T10:00:00.000Z',
          kind: 'basic',
          fields: { front: 'spielen' },
          isReviewSupported: false,
          reviewUnsupportedReason: REVIEW_UNSUPPORTED_REASONS.invalidPayload,
          consecutiveSuccessCount: 0,
        },
        reviewRenderer: null,
      }),
    );

    render(<ReviewScreen deckId="deck-1" />);

    expect(screen.getByTestId('review-unsupported-card')).toHaveTextContent(
      REVIEW_UNSUPPORTED_REASONS.invalidPayload,
    );
  });

  it('renders supported review card flow for valid basic item', () => {
    mockedUseReviewScreen.mockReturnValue(
      buildHookResult({
        currentItem: {
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
        reviewRenderer: {
          renderer: 'basic',
          basicCardFields: { front: 'spielen', back: 'to play' },
        },
      }),
    );

    render(<ReviewScreen deckId="deck-1" />);

    expect(screen.getByTestId('review-current-item-card')).toBeInTheDocument();
    expect(screen.getByTestId('review-grade-buttons')).toBeInTheDocument();
  });

  it('keeps grade buttons enabled before answer reveal', () => {
    mockedUseReviewScreen.mockReturnValue(
      buildHookResult({
        currentItem: {
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
        isAnswerRevealed: false,
        isGrading: false,
        reviewRenderer: {
          renderer: 'basic',
          basicCardFields: { front: 'spielen', back: 'to play' },
        },
      }),
    );

    render(<ReviewScreen deckId="deck-1" />);

    expect(screen.getByTestId('review-grade-buttons')).toHaveAttribute(
      'data-disabled',
      'false',
    );
  });

  it('disables grade buttons while submitting', () => {
    mockedUseReviewScreen.mockReturnValue(
      buildHookResult({
        currentItem: {
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
        isAnswerRevealed: true,
        isGrading: true,
        reviewRenderer: {
          renderer: 'basic',
          basicCardFields: { front: 'spielen', back: 'to play' },
        },
      }),
    );

    render(<ReviewScreen deckId="deck-1" />);

    expect(screen.getByTestId('review-grade-buttons')).toHaveAttribute(
      'data-disabled',
      'true',
    );
  });
});

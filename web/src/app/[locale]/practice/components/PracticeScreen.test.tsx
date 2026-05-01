import { render, screen } from '@testing-library/react';
import type React from 'react';

import { usePracticeScreen } from '@features/reviews';
import PracticeScreen from './PracticeScreen';

jest.mock('@features/reviews', () => ({
  usePracticeScreen: jest.fn(),
}));

jest.mock('@/i18n/navigation', () => ({
  Link: ({
    children,
    href,
    className,
  }: {
    children: React.ReactNode;
    href: string;
    className?: string;
  }) => (
    <a href={href} className={className}>
      {children}
    </a>
  ),
}));

jest.mock('@shared/components', () => ({
  Button: ({
    children,
    disabled,
    onClick,
    type,
  }: {
    children: React.ReactNode;
    disabled?: boolean;
    onClick?: () => void;
    type?: 'button' | 'submit' | 'reset';
  }) => (
    <button disabled={disabled} onClick={onClick} type={type}>
      {children}
    </button>
  ),
  ErrorMessage: ({ message }: { message: string }) => <div>{message}</div>,
  PageLoader: () => <div>loading</div>,
}));

jest.mock('../../review/components/ReviewCurrentItemCard', () => {
  function MockReviewCurrentItemCard() {
    return <div data-testid="practice-card">card</div>;
  }

  return MockReviewCurrentItemCard;
});

const mockedUsePracticeScreen = usePracticeScreen as jest.MockedFunction<
  typeof usePracticeScreen
>;

describe('PracticeScreen', () => {
  beforeEach(() => {
    mockedUsePracticeScreen.mockReset();
  });

  it('renders non-mutating practice navigation for a deck item', () => {
    mockedUsePracticeScreen.mockReturnValue({
      currentItem: {
        cardId: 'card-1',
        deckId: 'deck-1',
        chunkId: 'chunk-1',
        chunkTitle: 'chunk',
        chunkPosition: 0,
        positionInChunk: 0,
        kind: 'basic',
        fields: { front: 'eins', back: 'one' },
        isReviewSupported: true,
        reviewUnsupportedReason: null,
      },
      errorMessage: undefined,
      hasNextItem: true,
      hasPreviousItem: false,
      isAnswerRevealed: false,
      isLoading: false,
      positionLabel: '1 of 2',
      reviewRenderer: {
        renderer: 'basic',
        basicCardFields: { front: 'eins', back: 'one' },
      },
      totalCount: 2,
      handleNextItem: jest.fn(),
      handlePreviousItem: jest.fn(),
      handleRevealAnswer: jest.fn(),
    });

    render(<PracticeScreen deckId="deck-1" />);

    expect(screen.getByText('Practice')).toBeInTheDocument();
    expect(screen.getByText('1 of 2')).toBeInTheDocument();
    expect(screen.getByTestId('practice-card')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Review Due Cards' })).toHaveAttribute(
      'href',
      '/review?deckId=deck-1',
    );
    expect(screen.getByRole('button', { name: 'Next' })).toBeEnabled();
  });
});

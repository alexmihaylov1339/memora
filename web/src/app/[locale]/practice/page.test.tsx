import { render, screen } from '@testing-library/react';
import type React from 'react';

import { useSearchParams } from 'next/navigation';

import { useDeckDetailQuery } from '@features/decks';
import PracticePage from './page';

jest.mock('next/navigation', () => ({
  useSearchParams: jest.fn(),
}));

jest.mock('@features/decks', () => ({
  useDeckDetailQuery: jest.fn(),
}));

jest.mock('@shared/components', () => ({
  ErrorMessage: ({ message }: { message: string }) => <div>{message}</div>,
  PageLoader: () => <div>loading</div>,
  ProtectedRoute: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

jest.mock('./components/PracticeScreen', () => {
  function MockPracticeScreen({ deckId }: { deckId: string | null }) {
    return <div>standard practice {deckId}</div>;
  }

  return MockPracticeScreen;
});

jest.mock('./components/KidsPracticeScreen', () => {
  function MockKidsPracticeScreen({ deckId }: { deckId: string | null }) {
    return <div>kids practice {deckId}</div>;
  }

  return MockKidsPracticeScreen;
});

const mockedUseSearchParams = useSearchParams as jest.MockedFunction<
  typeof useSearchParams
>;
const mockedUseDeckDetailQuery = useDeckDetailQuery as jest.MockedFunction<
  typeof useDeckDetailQuery
>;

describe('PracticePage', () => {
  beforeEach(() => {
    mockedUseSearchParams.mockReset();
    mockedUseDeckDetailQuery.mockReset();
  });

  it('renders the kids player for kids decks', () => {
    mockedUseSearchParams.mockReturnValue(
      new URLSearchParams('deckId=deck-1') as ReturnType<typeof useSearchParams>,
    );
    mockedUseDeckDetailQuery.mockReturnValue({
      result: { presentationMode: 'kids' },
      isLoading: false,
      error: null,
    } as ReturnType<typeof useDeckDetailQuery>);

    render(<PracticePage />);

    expect(screen.getByText('kids practice deck-1')).toBeInTheDocument();
  });

  it('renders the standard practice screen for standard decks', () => {
    mockedUseSearchParams.mockReturnValue(
      new URLSearchParams('deckId=deck-1') as ReturnType<typeof useSearchParams>,
    );
    mockedUseDeckDetailQuery.mockReturnValue({
      result: { presentationMode: 'standard' },
      isLoading: false,
      error: null,
    } as ReturnType<typeof useDeckDetailQuery>);

    render(<PracticePage />);

    expect(screen.getByText('standard practice deck-1')).toBeInTheDocument();
  });
});

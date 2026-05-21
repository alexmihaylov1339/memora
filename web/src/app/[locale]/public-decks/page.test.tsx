import { render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';

import { usePublicDecksQuery } from '@features/decks';
import PublicDecksPage from './page';

jest.mock('@features/decks', () => ({
  usePublicDecksQuery: jest.fn(),
}));

jest.mock('@shared/components', () => ({
  ErrorMessage: ({ message }: { message: string }) => <div>{message}</div>,
  PageLoader: () => <div>loading</div>,
  ProtectedRoute: ({ children }: { children: ReactNode }) => <>{children}</>,
}));

jest.mock('./components/PublicDecksWorkspace', () => {
  function MockPublicDecksWorkspace() {
    return <div>public decks workspace</div>;
  }

  return MockPublicDecksWorkspace;
});

const mockedUsePublicDecksQuery =
  usePublicDecksQuery as jest.MockedFunction<typeof usePublicDecksQuery>;

describe('PublicDecksPage', () => {
  beforeEach(() => {
    mockedUsePublicDecksQuery.mockReset();
  });

  it('renders the public decks workspace when decks are loaded', () => {
    mockedUsePublicDecksQuery.mockReturnValue({
      isLoading: false,
      isLoaded: true,
      isRefetching: false,
      error: null,
      result: [],
      refetch: jest.fn(),
    } as unknown as ReturnType<typeof usePublicDecksQuery>);

    render(<PublicDecksPage />);

    expect(screen.getByText('public decks workspace')).toBeInTheDocument();
  });
});

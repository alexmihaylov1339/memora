import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import type { ButtonHTMLAttributes, ReactNode } from 'react';
import CardsPage from './page';

const mockReplace = jest.fn();
const mockRefetch = jest.fn();
const mockMoveFetch = jest.fn();

let currentDeckId = '';

const mockUseCardsListQuery = jest.fn();
const mockUseDeckMovableCardsQuery = jest.fn();
const mockUseMoveDeckCardsMutation = jest.fn();
const mockUseCardGridColumns = jest.fn();

jest.mock('next/navigation', () => ({
  useSearchParams: () => ({
    get: (key: string) => (key === 'deckId' ? currentDeckId : null),
  }),
}));

jest.mock('@/i18n/navigation', () => ({
  useRouter: () => ({ replace: mockReplace }),
  Link: ({ href, children, ...props }: { href: string | { pathname: string; query?: Record<string, string> }; children: ReactNode }) => {
    const resolvedHref =
      typeof href === 'string'
        ? href
        : `${href.pathname}?${new URLSearchParams(href.query ?? {}).toString()}`;
    return (
      <a href={resolvedHref} {...props}>
        {children}
      </a>
    );
  },
}));

jest.mock('@shared/components', () => ({
  BackLinkButton: ({
    href,
    children,
  }: {
    href: string | { pathname: string; query?: Record<string, string> };
    children: ReactNode;
  }) => {
    const resolvedHref =
      typeof href === 'string'
        ? href
        : `${href.pathname}?${new URLSearchParams(href.query ?? {}).toString()}`;
    return <a href={resolvedHref}>{children}</a>;
  },
  ProtectedRoute: ({ children }: { children: ReactNode }) => <>{children}</>,
  PageLoader: () => <div>loading</div>,
  ErrorMessage: ({ message }: { message: string }) => <div>{message}</div>,
  Button: ({ children, ...props }: ButtonHTMLAttributes<HTMLButtonElement>) => (
    <button {...props}>{children}</button>
  ),
  EntitySearch: () => <div>entity-search</div>,
  Grid: ({
    rowData,
    columnDefs,
  }: {
    rowData: Array<Record<string, unknown>>;
    columnDefs: Array<{ headerName?: string; cellRenderer?: (row: Record<string, unknown>) => ReactNode }>;
  }) => (
    <div>
      {rowData.map((row, rowIndex) => (
        <div key={String(row.id ?? rowIndex)}>
          {columnDefs.map((column, columnIndex) => (
            <div key={`${rowIndex}-${columnIndex}`}>
              {column.cellRenderer ? column.cellRenderer(row) : null}
            </div>
          ))}
        </div>
      ))}
    </div>
  ),
}));

jest.mock('@features/decks', () => ({
  cardService: { search: jest.fn() },
  useCardsListQuery: (...args: unknown[]) => mockUseCardsListQuery(...args),
  useDeckMovableCardsQuery: (...args: unknown[]) => mockUseDeckMovableCardsQuery(...args),
  useMoveDeckCardsMutation: (...args: unknown[]) => mockUseMoveDeckCardsMutation(...args),
}));

jest.mock('./components', () => ({
  useCardGridColumns: (...args: unknown[]) => mockUseCardGridColumns(...args),
}));

describe('CardsPage move flow regression', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    currentDeckId = 'deck-1';

    mockUseCardGridColumns.mockReturnValue([]);
    mockUseCardsListQuery.mockReturnValue({
      isLoading: false,
      error: undefined,
      result: [],
    });
    mockUseDeckMovableCardsQuery.mockReturnValue({
      isLoading: false,
      error: undefined,
      result: [{ id: 'card-1' }],
      refetch: mockRefetch,
    });
    mockUseMoveDeckCardsMutation.mockImplementation((options?: { onSuccess?: () => void }) => ({
      error: undefined,
      fetch: async (payload: { deckId: string; cardIds: string[] }) => {
        mockMoveFetch(payload);
        options?.onSuccess?.();
      },
    }));
  });

  it('refreshes movable list after moving a card to a deck', async () => {
    render(<CardsPage />);

    fireEvent.click(screen.getByRole('button', { name: 'Move to Deck' }));

    await waitFor(() => {
      expect(mockMoveFetch).toHaveBeenCalledWith({
        deckId: 'deck-1',
        cardIds: ['card-1'],
      });
      expect(mockRefetch).toHaveBeenCalled();
    });
  });
});

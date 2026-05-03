import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import type { ButtonHTMLAttributes, ReactNode } from 'react';
import ChunksPage from './page';

const mockReplace = jest.fn();
const mockRefetch = jest.fn();
const mockMoveFetch = jest.fn();

let currentDeckId = '';

const mockUseChunksListQuery = jest.fn();
const mockUseDeckMovableChunksQuery = jest.fn();
const mockUseMoveDeckChunksMutation = jest.fn();
const mockUseChunkGridColumns = jest.fn();

jest.mock('next/navigation', () => ({
  useSearchParams: () => ({
    get: (key: string) => (key === 'deckId' ? currentDeckId : null),
  }),
}));

jest.mock('@/i18n/navigation', () => ({
  useRouter: () => ({ replace: mockReplace }),
  Link: ({
    href,
    children,
    ...props
  }: {
    href: string | { pathname: string; query?: Record<string, string> };
    children: ReactNode;
  }) => {
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

jest.mock('@features/chunks', () => ({
  chunkService: { search: jest.fn() },
  useChunksListQuery: (...args: unknown[]) => mockUseChunksListQuery(...args),
  useDeckMovableChunksQuery: (...args: unknown[]) => mockUseDeckMovableChunksQuery(...args),
  useMoveDeckChunksMutation: (...args: unknown[]) => mockUseMoveDeckChunksMutation(...args),
}));

jest.mock('./components/useChunkGridColumns', () => ({
  __esModule: true,
  default: (...args: unknown[]) => mockUseChunkGridColumns(...args),
}));

describe('ChunksPage regressions', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    mockUseChunkGridColumns.mockReturnValue([]);
    mockUseChunksListQuery.mockReturnValue({
      isLoading: false,
      error: undefined,
      result: [{ id: 'chunk-1' }],
    });
    mockUseDeckMovableChunksQuery.mockReturnValue({
      isLoading: false,
      error: undefined,
      result: [{ id: 'chunk-1' }],
      refetch: mockRefetch,
    });
    mockUseMoveDeckChunksMutation.mockImplementation((options?: { onSuccess?: () => void }) => ({
      error: undefined,
      fetch: async (payload: { deckId: string; chunkIds: string[] }) => {
        mockMoveFetch(payload);
        options?.onSuccess?.();
      },
    }));
  });

  it('shows Create Chunk CTA on global chunks page', () => {
    currentDeckId = '';

    render(<ChunksPage />);

    const createLink = screen.getByRole('link', { name: 'Create Chunk' });
    expect(createLink).toHaveAttribute('href', '/chunks/new');
  });

  it('refreshes movable list after moving a chunk to a deck', async () => {
    currentDeckId = 'deck-1';

    render(<ChunksPage />);

    fireEvent.click(screen.getByRole('button', { name: 'Move to Deck' }));

    await waitFor(() => {
      expect(mockMoveFetch).toHaveBeenCalledWith({
        deckId: 'deck-1',
        chunkIds: ['chunk-1'],
      });
      expect(mockRefetch).toHaveBeenCalled();
    });
  });
});

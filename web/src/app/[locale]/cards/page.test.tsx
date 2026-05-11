import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import type { ButtonHTMLAttributes, ReactNode } from 'react';
import CardsPage from './page';

const mockReplace = jest.fn();
const mockRefetch = jest.fn();
const mockMoveFetch = jest.fn();
const mockDeleteFetch = jest.fn();

let currentDeckId = '';

const mockUseCardsListQuery = jest.fn();
const mockUseDeckMovableCardsQuery = jest.fn();
const mockUseMoveDeckCardsMutation = jest.fn();
const mockUseDeleteCardMutation = jest.fn();
const mockUseCardGridColumns = jest.fn();
const mockUseCardsPageGridColumns = jest.fn();
const mockUseCardsImportModal = jest.fn();

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
  ConfirmationModal: ({
    confirmLabel = 'Confirm',
    isOpen,
    message,
    onCancel,
    onConfirm,
    title,
  }: {
    confirmLabel?: string;
    isOpen: boolean;
    message: string;
    onCancel: () => void;
    onConfirm: () => void;
    title: string;
  }) =>
    isOpen ? (
      <div role="dialog" aria-label={title}>
        <p>{message}</p>
        <button type="button" onClick={onCancel}>
          Cancel
        </button>
        <button type="button" onClick={onConfirm}>
          {confirmLabel}
        </button>
      </div>
    ) : null,
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
  getCardPreview: () => ({ front: 'Card front', back: 'Card back' }),
  ImportCsvModal: () => null,
  useCardsListQuery: (...args: unknown[]) => mockUseCardsListQuery(...args),
  useDeleteCardMutation: (...args: unknown[]) => mockUseDeleteCardMutation(...args),
  useDeckMovableCardsQuery: (...args: unknown[]) => mockUseDeckMovableCardsQuery(...args),
  useMoveDeckCardsMutation: (...args: unknown[]) => mockUseMoveDeckCardsMutation(...args),
}));

jest.mock('./components', () => ({
  CardsGridSection: ({
    columnDefs,
    onDeleteCard,
    result = [],
  }: {
    columnDefs: Array<{
      cellRenderer?: (row: Record<string, unknown>) => ReactNode;
    }>;
    onDeleteCard?: (row: Record<string, unknown>) => Promise<void> | void;
    result?: Array<Record<string, unknown>>;
  }) => {
    const React = jest.requireActual('react') as typeof import('react');
    const [pendingRow, setPendingRow] =
      React.useState<Record<string, unknown> | null>(null);

    return (
      <div>
        {result.map((row, rowIndex) => (
          <div key={String(row.id ?? rowIndex)}>
            {columnDefs.map((column, columnIndex) => (
              <div key={`${rowIndex}-${columnIndex}`}>
                {column.cellRenderer ? column.cellRenderer(row) : null}
              </div>
            ))}
            {onDeleteCard && (
              <button type="button" onClick={() => setPendingRow(row)}>
                Delete
              </button>
            )}
          </div>
        ))}
        {pendingRow && (
          <div role="dialog" aria-label="Delete card?">
            <button type="button" onClick={() => setPendingRow(null)}>
              Cancel
            </button>
            <button
              type="button"
              onClick={() => {
                void onDeleteCard?.(pendingRow);
                setPendingRow(null);
              }}
            >
              Delete
            </button>
          </div>
        )}
      </div>
    );
  },
  CardsPageIntro: ({
    description,
    title,
  }: {
    description: string;
    title: string;
  }) => (
    <div>
      <h1>{title}</h1>
      <p>{description}</p>
    </div>
  ),
  CardsToolbar: ({
    createCardHref,
    onImportClick,
  }: {
    createCardHref: string | { pathname: string; query?: Record<string, string> };
    onImportClick: () => void;
  }) => (
    <div>
      <button type="button" onClick={onImportClick}>
        Import CSV
      </button>
      <a
        href={
          typeof createCardHref === 'string'
            ? createCardHref
            : createCardHref.pathname
        }
      >
        Create Card
      </a>
    </div>
  ),
  useCardGridColumns: (...args: unknown[]) => mockUseCardGridColumns(...args),
  useCardsImportModal: (...args: unknown[]) => mockUseCardsImportModal(...args),
  useCardsPageGridColumns: (...args: unknown[]) =>
    mockUseCardsPageGridColumns(...args),
}));

describe('CardsPage move flow regression', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    currentDeckId = 'deck-1';

    mockUseCardGridColumns.mockReturnValue([]);
    mockUseCardsImportModal.mockReturnValue({
      handleClose: jest.fn(),
      handleImportComplete: jest.fn(),
      handleOpen: jest.fn(),
      isOpen: false,
    });
    mockUseCardsPageGridColumns.mockImplementation(
      ({
        isMoveContext,
        onMoveCard,
      }: {
        isMoveContext: boolean;
        onMoveCard: (id: string) => void;
      }) =>
        isMoveContext
          ? [
              {
                headerName: 'Actions',
                cellRenderer: (row: Record<string, unknown>) => (
                  <button
                    type="button"
                    onClick={() => onMoveCard(String(row.id))}
                  >
                    Move to Deck
                  </button>
                ),
              },
            ]
          : [],
    );
    mockUseCardsListQuery.mockReturnValue({
      isLoading: false,
      error: undefined,
      result: [],
      refetch: mockRefetch,
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
    mockUseDeleteCardMutation.mockImplementation((options?: { onSuccess?: () => void }) => ({
      error: undefined,
      fetch: async (payload: { id: string }) => {
        mockDeleteFetch(payload);
        options?.onSuccess?.();
      },
      isLoading: false,
      reset: jest.fn(),
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

describe('CardsPage delete flow', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    currentDeckId = '';

    mockUseCardGridColumns.mockReturnValue([]);
    mockUseCardsImportModal.mockReturnValue({
      handleClose: jest.fn(),
      handleImportComplete: jest.fn(),
      handleOpen: jest.fn(),
      isOpen: false,
    });
    mockUseCardsPageGridColumns.mockImplementation(
      ({
        isMoveContext,
        onMoveCard,
      }: {
        isMoveContext: boolean;
        onMoveCard: (id: string) => void;
      }) =>
        isMoveContext
          ? [
              {
                headerName: 'Actions',
                cellRenderer: (row: Record<string, unknown>) => (
                  <button
                    type="button"
                    onClick={() => onMoveCard(String(row.id))}
                  >
                    Move to Deck
                  </button>
                ),
              },
            ]
          : [],
    );
    mockUseCardsListQuery.mockReturnValue({
      isLoading: false,
      error: undefined,
      result: [{ id: 'card-1' }],
      refetch: mockRefetch,
    });
    mockUseDeckMovableCardsQuery.mockReturnValue({
      isLoading: false,
      error: undefined,
      result: [],
      refetch: jest.fn(),
    });
    mockUseMoveDeckCardsMutation.mockReturnValue({
      error: undefined,
      fetch: jest.fn(),
    });
    mockUseDeleteCardMutation.mockImplementation((options?: { onSuccess?: () => void }) => ({
      error: undefined,
      fetch: async (payload: { id: string }) => {
        mockDeleteFetch(payload);
        options?.onSuccess?.();
      },
      isLoading: false,
      reset: jest.fn(),
    }));
  });

  it('deletes a card from the cards grid without opening edit', async () => {
    render(<CardsPage />);

    fireEvent.click(screen.getByRole('button', { name: 'Delete' }));
    expect(mockDeleteFetch).not.toHaveBeenCalled();
    const dialog = screen.getByRole('dialog', { name: 'Delete card?' });
    expect(dialog).toBeInTheDocument();

    fireEvent.click(within(dialog).getByRole('button', { name: 'Delete' }));

    await waitFor(() => {
      expect(mockDeleteFetch).toHaveBeenCalledWith({ id: 'card-1' });
      expect(mockRefetch).toHaveBeenCalled();
      expect(mockReplace).not.toHaveBeenCalled();
    });
  });
});

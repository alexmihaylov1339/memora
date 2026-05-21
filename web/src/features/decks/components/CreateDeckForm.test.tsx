import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import type { ButtonHTMLAttributes, ReactNode } from 'react';

import CreateDeckForm from './CreateDeckForm';

const mockReplace = jest.fn();
const mockInvalidateQueries = jest.fn();
const mockSuccess = jest.fn();
const mockError = jest.fn();
const mockWarning = jest.fn();
const mockCreateDeckFetch = jest.fn();
const mockImportFetch = jest.fn();

jest.mock('@tanstack/react-query', () => ({
  useQueryClient: () => ({
    invalidateQueries: mockInvalidateQueries,
  }),
}));

jest.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}));

jest.mock('@/i18n/navigation', () => ({
  useRouter: () => ({
    replace: mockReplace,
  }),
}));

jest.mock('@shared/providers', () => ({
  useNotification: () => ({
    success: mockSuccess,
    error: mockError,
    warning: mockWarning,
  }),
}));

jest.mock('../hooks', () => ({
  useCreateDeckMutation: () => ({
    error: undefined,
    fetch: mockCreateDeckFetch,
    isLoading: false,
  }),
  useImportCardsMutation: () => ({
    fetch: mockImportFetch,
  }),
}));

jest.mock('./DeckCardSelectionPanel', () => ({
  __esModule: true,
  default: function MockDeckCardSelectionPanel() {
    return <div>card selection</div>;
  },
}));

jest.mock('./DeckChunkSelectionPanel', () => ({
  __esModule: true,
  default: function MockDeckChunkSelectionPanel() {
    return <div>chunk selection</div>;
  },
}));
jest.mock('./CreateDeckForm.module.scss', () => ({
  actionRow: 'action-row',
  container: 'container',
  form: 'form',
  primaryButton: 'primary-button',
  section: 'section',
}));

jest.mock('./ImportCsvModal', () => ({
  ImportCsvModal: ({
    deferred,
    isOpen,
    onClose,
    onDeferredConfirm,
  }: {
    deferred?: boolean;
    isOpen: boolean;
    onClose: () => void;
    onDeferredConfirm?: (file: File, rowCount: number) => void;
  }) =>
    isOpen ? (
      <div role="dialog" aria-label="Import CSV">
        {deferred && (
          <button
            type="button"
            onClick={() =>
              onDeferredConfirm?.(
                new File(['front,back'], 'cards.csv', { type: 'text/csv' }),
                2,
              )
            }
          >
            Confirm Deferred Import
          </button>
        )}
        <button type="button" onClick={onClose}>
          Close Import
        </button>
      </div>
    ) : null,
}));

jest.mock('@shared/components', () => ({
  Button: ({
    children,
    ...props
  }: ButtonHTMLAttributes<HTMLButtonElement>) => (
    <button {...props}>{children}</button>
  ),
  FormBuilder: ({
    leadingAction,
    onSubmit,
    submitLabel,
  }: {
    leadingAction?: ReactNode;
    onSubmit: (values: {
      name: string;
      description?: string;
      cardIds?: string[];
      chunkIds?: string[];
      presentationMode: 'standard' | 'kids';
      reviewIntervalsInput: string;
    }) => Promise<void> | void;
    submitLabel: string;
  }) => (
    <div>
      {leadingAction}
      <button
        type="button"
        onClick={() =>
          void onSubmit({
            name: '  Kids deck  ',
            description: '  For toddlers  ',
            cardIds: ['card-1'],
            chunkIds: ['chunk-1'],
            presentationMode: 'kids',
            reviewIntervalsInput: '1d, 2d',
          })
        }
      >
        {submitLabel}
      </button>
    </div>
  ),
}));

describe('CreateDeckForm CSV import flow', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockCreateDeckFetch.mockResolvedValue({
      id: 'deck-1',
      name: 'Kids deck',
    });
    mockImportFetch.mockResolvedValue({
      created: 2,
      skipped: [],
    });
  });

  it('stores deferred csv import state and shows the summary message', () => {
    render(<CreateDeckForm />);

    fireEvent.click(screen.getByRole('button', { name: 'Import CSV' }));
    fireEvent.click(
      screen.getByRole('button', { name: 'Confirm Deferred Import' }),
    );

    expect(
      screen.getByText('2 cards from CSV will be imported when you save.'),
    ).toBeInTheDocument();
  });

  it('creates the deck, imports the csv, and redirects to deck edit', async () => {
    render(<CreateDeckForm />);

    fireEvent.click(screen.getByRole('button', { name: 'Import CSV' }));
    fireEvent.click(
      screen.getByRole('button', { name: 'Confirm Deferred Import' }),
    );
    fireEvent.click(screen.getByRole('button', { name: 'decks.createButton' }));

    await waitFor(() => {
      expect(mockCreateDeckFetch).toHaveBeenCalledWith({
        name: 'Kids deck',
        description: 'For toddlers',
        cardIds: ['card-1'],
        chunkIds: ['chunk-1'],
        presentationMode: 'kids',
        reviewIntervalHours: [24, 48],
      });
      expect(mockImportFetch).toHaveBeenCalledWith({
        file: expect.any(File),
        deckId: 'deck-1',
      });
      expect(mockSuccess).toHaveBeenCalledWith('cards.importSuccess', {
        created: 2,
        skipped: 0,
      });
      expect(mockReplace).toHaveBeenCalledWith('/decks/deck-1/edit');
    });
  });

  it('warns and still redirects when csv import fails after deck creation', async () => {
    mockImportFetch.mockRejectedValue(new Error('boom'));

    render(<CreateDeckForm />);

    fireEvent.click(screen.getByRole('button', { name: 'Import CSV' }));
    fireEvent.click(
      screen.getByRole('button', { name: 'Confirm Deferred Import' }),
    );
    fireEvent.click(screen.getByRole('button', { name: 'decks.createButton' }));

    await waitFor(() => {
      expect(mockCreateDeckFetch).toHaveBeenCalled();
      expect(mockImportFetch).toHaveBeenCalledWith({
        file: expect.any(File),
        deckId: 'deck-1',
      });
      expect(mockWarning).toHaveBeenCalledWith('decks.csvImportFailed');
      expect(mockReplace).toHaveBeenCalledWith('/decks/deck-1/edit');
    });
  });
});

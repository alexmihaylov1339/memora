import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import type { ButtonHTMLAttributes } from 'react';

import { ImportCsvModal } from './ImportCsvModal';

const mockFetch = jest.fn();
const mockParseCsvText = jest.fn();

jest.mock('../hooks', () => ({
  useImportCardsMutation: () => ({
    fetch: mockFetch,
  }),
}));

jest.mock('../utils', () => ({
  parseCsvText: (text: string) => mockParseCsvText(text),
}));

jest.mock('@shared/components', () => ({
  Button: ({
    children,
    ...props
  }: ButtonHTMLAttributes<HTMLButtonElement>) => (
    <button {...props}>{children}</button>
  ),
  ErrorMessage: ({ message }: { message: string }) => <div>{message}</div>,
  Grid: ({
    rowData,
  }: {
    rowData: Array<{ front: string; back: string }>;
  }) => (
    <div>
      {rowData.map((row, index) => (
        <div key={index}>
          <span>{row.front}</span>
          <span>{row.back}</span>
        </div>
      ))}
    </div>
  ),
}));

function buildFile(name = 'cards.csv', content = 'front,back') {
  const file = new File([content], name, { type: 'text/csv' });
  Object.defineProperty(file, 'text', {
    value: jest.fn().mockResolvedValue(content),
  });
  return file;
}

describe('ImportCsvModal', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('shows preview rows and skipped-row warnings after parsing a file', async () => {
    mockParseCsvText.mockReturnValue({
      rows: [
        { front: 'One', back: 'Two' },
        { front: 'Three', back: 'Four' },
      ],
      skipped: [{ row: 4, reason: 'missing back side' }],
    });

    const { container } = render(<ImportCsvModal isOpen onClose={jest.fn()} />);

    const input = container.querySelector('input[type="file"]') as HTMLInputElement;
    fireEvent.change(input, { target: { files: [buildFile()] } });

    await waitFor(() => {
      expect(screen.getByText('2 cards ready to import, 1 row skipped.')).toBeInTheDocument();
      expect(screen.getByText('One')).toBeInTheDocument();
      expect(screen.getByText('Two')).toBeInTheDocument();
      expect(screen.getByText('Three')).toBeInTheDocument();
      expect(screen.getByText('Four')).toBeInTheDocument();
      expect(screen.getByText('Row 4: missing back side')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Import 2 cards' })).toBeInTheDocument();
    });
  });

  it('queues deferred imports and closes the modal without calling the API', async () => {
    const handleClose = jest.fn();
    const handleDeferredConfirm = jest.fn();

    mockParseCsvText.mockReturnValue({
      rows: [{ front: 'One', back: 'Two' }],
      skipped: [],
    });

    const { container } = render(
      <ImportCsvModal
        isOpen
        onClose={handleClose}
        deferred
        onDeferredConfirm={handleDeferredConfirm}
      />,
    );

    const input = container.querySelector('input[type="file"]') as HTMLInputElement;
    fireEvent.change(input, { target: { files: [buildFile()] } });

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Queue 1 cards' })).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: 'Queue 1 cards' }));

    expect(handleDeferredConfirm).toHaveBeenCalledWith(expect.any(File), 1);
    expect(mockFetch).not.toHaveBeenCalled();
    expect(handleClose).toHaveBeenCalled();
  });

  it('imports immediately and forwards the result to the caller', async () => {
    const handleClose = jest.fn();
    const handleImportComplete = jest.fn();

    mockParseCsvText.mockReturnValue({
      rows: [{ front: 'One', back: 'Two' }],
      skipped: [],
    });
    mockFetch.mockResolvedValue({ created: 1, skipped: [] });

    const { container } = render(
      <ImportCsvModal
        isOpen
        onClose={handleClose}
        deckId="deck-1"
        onImportComplete={handleImportComplete}
      />,
    );

    const input = container.querySelector('input[type="file"]') as HTMLInputElement;
    fireEvent.change(input, { target: { files: [buildFile()] } });

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Import 1 cards' })).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: 'Import 1 cards' }));

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith({
        file: expect.any(File),
        deckId: 'deck-1',
      });
      expect(handleImportComplete).toHaveBeenCalledWith({
        created: 1,
        skipped: [],
      });
      expect(handleClose).toHaveBeenCalled();
    });
  });

  it('shows the import error and lets the user reset to idle', async () => {
    mockParseCsvText.mockReturnValue({
      rows: [{ front: 'One', back: 'Two' }],
      skipped: [],
    });
    mockFetch.mockRejectedValue(new Error('Import failed on server.'));

    const { container } = render(
      <ImportCsvModal isOpen onClose={jest.fn()} deckId="deck-1" />,
    );

    const input = container.querySelector('input[type="file"]') as HTMLInputElement;
    fireEvent.change(input, { target: { files: [buildFile()] } });

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Import 1 cards' })).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: 'Import 1 cards' }));

    await waitFor(() => {
      expect(screen.getByText('Import failed on server.')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Try again' })).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: 'Try again' }));

    expect(screen.getByText('Select CSV file')).toBeInTheDocument();
  });
});

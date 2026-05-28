import { fireEvent, render, screen } from '@testing-library/react';
import type { ButtonHTMLAttributes, ReactNode } from 'react';

import DeckEditForm from './DeckEditForm';

const mockOnImportComplete = jest.fn();

jest.mock('@features/decks', () => ({
  DeckCardSelectionPanel: () => <div>card selection</div>,
  DeckChunkSelectionPanel: () => <div>chunk selection</div>,
  ImportCsvModal: ({
    deckId,
    isOpen,
    onImportComplete,
  }: {
    deckId?: string;
    isOpen: boolean;
    onImportComplete?: (result: { created: number; skipped: [] }) => void;
  }) =>
    isOpen ? (
      <div role="dialog" aria-label="Import CSV">
        <span>{deckId}</span>
        <button
          type="button"
          onClick={() => onImportComplete?.({ created: 3, skipped: [] })}
        >
          Complete Import
        </button>
      </div>
    ) : null,
  formatDeckReviewIntervalsInput: () => '0, 24',
  parseDeckReviewIntervalsInput: () => [0, 24],
  useDeckEditFormFields: () => [],
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
  }: {
    leadingAction?: ReactNode;
  }) => <div>{leadingAction}</div>,
}));

jest.mock('@shared/constants', () => ({
  BUTTON_STYLES: {
    destructiveSolid: 'destructive',
  },
}));

jest.mock('@features/decks/components/CreateDeckForm.module.scss', () => ({
  actionRow: 'action-row',
  container: 'container',
  form: 'form',
  primaryButton: 'primary-button',
  section: 'section',
}));

describe('DeckEditForm CSV import flow', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('opens the import modal with the deck id and forwards completion results', () => {
    render(
      <DeckEditForm
        id="deck-1"
        name="Kids deck"
        presentationMode="kids"
        reviewIntervalHours={[0, 24]}
        onDelete={jest.fn()}
        isDeleting={false}
        onUpdate={jest.fn()}
        onImportComplete={mockOnImportComplete}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Import CSV' }));

    expect(screen.getByRole('dialog', { name: 'Import CSV' })).toBeInTheDocument();
    expect(screen.getByText('deck-1')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Complete Import' }));

    expect(mockOnImportComplete).toHaveBeenCalledWith({
      created: 3,
      skipped: [],
    });
  });
});

import { useMemo } from 'react';

import { ErrorMessage, Grid, type GridColumnDef } from '@shared/components';

import { CARD_LIBRARY_PICKER_PAGE_SIZE } from '../constants';
import type { CardLibraryRow } from './cardLibraryPickerHelpers';

interface CardLibraryPickerGridProps {
  rows: CardLibraryRow[];
  searchText: string;
  isLoading: boolean;
  errorMessage?: string;
  onSearchChange: (value: string) => void;
  onToggleCard: (cardId: string) => void;
}

export default function CardLibraryPickerGrid({
  rows,
  searchText,
  isLoading,
  errorMessage,
  onSearchChange,
  onToggleCard,
}: CardLibraryPickerGridProps) {
  const columnDefs = useMemo<GridColumnDef<CardLibraryRow>[]>(
    () => [
      {
        headerName: 'Select',
        searchable: false,
        cellRenderer: (row) => (
          <input
            type="checkbox"
            checked={row.selected}
            onClick={(event) => event.stopPropagation()}
            onChange={() => onToggleCard(row.id)}
            aria-label={`Select ${row.label}`}
            className="h-4 w-4 cursor-pointer accent-brand-accent"
          />
        ),
      },
      { field: 'label', headerName: 'Front' },
      { field: 'description', headerName: 'Back' },
      { field: 'deckStatus', headerName: 'Deck' },
    ],
    [onToggleCard],
  );

  return (
    <>
      <label
        htmlFor="card-library-search"
        className="mb-2 block text-xs font-semibold text-ink-strong"
      >
        Search cards
      </label>
      <input
        id="card-library-search"
        value={searchText}
        onChange={(event) => onSearchChange(event.target.value)}
        className="mb-4 h-10 w-full rounded-[4px] border border-line bg-white px-3 text-sm text-ink-strong outline-none focus:border-brand-accent"
      />

      {isLoading && (
        <p className="py-8 text-center text-sm text-ink-muted">
          Loading cards...
        </p>
      )}

      {errorMessage && <ErrorMessage message={errorMessage} />}

      {!isLoading && !errorMessage && (
        <Grid
          id="card-library-picker-grid"
          rowData={rows}
          columnDefs={columnDefs}
          emptyMessage="No cards match your search."
          showQuickFilter={false}
          paginate
          pageSize={CARD_LIBRARY_PICKER_PAGE_SIZE}
          onRowClick={(row) => onToggleCard(row.id)}
        />
      )}
    </>
  );
}

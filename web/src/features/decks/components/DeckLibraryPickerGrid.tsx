import { useMemo } from 'react';

import { ErrorMessage, Grid, type GridColumnDef } from '@shared/components';

import { CARD_LIBRARY_PICKER_PAGE_SIZE } from '../constants';
import type { DeckLibraryRow } from './deckLibraryPickerHelpers';

interface DeckLibraryPickerGridProps {
  rows: DeckLibraryRow[];
  searchText: string;
  isLoading: boolean;
  errorMessage?: string;
  onSearchChange: (value: string) => void;
  onToggleDeck: (deckId: string) => void;
}

export default function DeckLibraryPickerGrid({
  rows,
  searchText,
  isLoading,
  errorMessage,
  onSearchChange,
  onToggleDeck,
}: DeckLibraryPickerGridProps) {
  const columnDefs = useMemo<GridColumnDef<DeckLibraryRow>[]>(
    () => [
      {
        headerName: 'Select',
        searchable: false,
        cellRenderer: (row) => (
          <input
            type="checkbox"
            checked={row.selected}
            onClick={(event) => event.stopPropagation()}
            onChange={() => onToggleDeck(row.id)}
            aria-label={`Select ${row.label}`}
            className="h-4 w-4 cursor-pointer accent-brand-accent"
          />
        ),
      },
      { field: 'label', headerName: 'Deck' },
      { field: 'cardCount', headerName: 'Cards' },
    ],
    [onToggleDeck],
  );

  return (
    <>
      <label
        htmlFor="deck-library-search"
        className="mb-2 block text-xs font-semibold text-ink-strong"
      >
        Search decks
      </label>
      <input
        id="deck-library-search"
        value={searchText}
        onChange={(event) => onSearchChange(event.target.value)}
        className="mb-4 h-10 w-full rounded-[4px] border border-line bg-white px-3 text-sm text-ink-strong outline-none focus:border-brand-accent"
      />

      {isLoading && (
        <p className="py-8 text-center text-sm text-ink-muted">
          Loading decks...
        </p>
      )}

      {errorMessage && <ErrorMessage message={errorMessage} />}

      {!isLoading && !errorMessage && (
        <Grid
          id="deck-library-picker-grid"
          rowData={rows}
          columnDefs={columnDefs}
          emptyMessage="No decks match your search."
          showQuickFilter={false}
          paginate
          pageSize={CARD_LIBRARY_PICKER_PAGE_SIZE}
          onRowClick={(row) => onToggleDeck(row.id)}
        />
      )}
    </>
  );
}

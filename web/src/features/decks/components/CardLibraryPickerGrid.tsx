import { useMemo } from 'react';
import { useTranslations } from 'next-intl';

import { ErrorMessage, Grid, type GridColumnDef } from '@shared/components';
import { TRANSLATION_KEYS } from '@/i18n';

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
  const t = useTranslations();
  const columnDefs = useMemo<GridColumnDef<CardLibraryRow>[]>(
    () => [
      {
        headerName: '',
        searchable: false,
        cellRenderer: (row) => (
          <input
            type="checkbox"
            checked={row.selected}
            onClick={(event) => event.stopPropagation()}
            onChange={() => onToggleCard(row.id)}
            aria-label={t(TRANSLATION_KEYS.cards.selectCard, {
              label: row.label,
            })}
            className="h-4 w-4 cursor-pointer accent-brand-accent"
          />
        ),
      },
      { field: 'label', headerName: t(TRANSLATION_KEYS.cards.front) },
      { field: 'description', headerName: t(TRANSLATION_KEYS.cards.back) },
      { field: 'deckStatus', headerName: t(TRANSLATION_KEYS.cards.deckColumn) },
    ],
    [onToggleCard, t],
  );

  return (
    <>
      <label
        htmlFor="card-library-search"
        className="mb-2 block text-xs font-semibold text-ink-strong"
      >
        {t(TRANSLATION_KEYS.cards.searchCards)}
      </label>
      <input
        id="card-library-search"
        value={searchText}
        onChange={(event) => onSearchChange(event.target.value)}
        className="mb-4 h-10 w-full rounded-[4px] border border-line bg-white px-3 text-sm text-ink-strong outline-none focus:border-brand-accent"
      />

      {isLoading && (
        <p className="py-8 text-center text-sm text-ink-muted">
          {t(TRANSLATION_KEYS.cards.loadingCards)}
        </p>
      )}

      {errorMessage && <ErrorMessage message={errorMessage} />}

      {!isLoading && !errorMessage && (
        <Grid
          id="card-library-picker-grid"
          rowData={rows}
          columnDefs={columnDefs}
          emptyMessage={t(TRANSLATION_KEYS.cards.noCardsMatch)}
          showQuickFilter={false}
          paginate
          pageSize={CARD_LIBRARY_PICKER_PAGE_SIZE}
          onRowClick={(row) => onToggleCard(row.id)}
        />
      )}
    </>
  );
}

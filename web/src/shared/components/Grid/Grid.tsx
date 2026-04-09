'use client';

import { useMemo, useState } from 'react';
import type { ReactNode } from 'react';

export interface GridColumnDef<TRow> {
  field?: keyof TRow;
  headerName: string;
  valueGetter?: (row: TRow) => ReactNode;
  cellRenderer?: (row: TRow) => ReactNode;
}

interface GridProps<TRow extends { id: string }> {
  id: string;
  rowData: TRow[];
  columnDefs: GridColumnDef<TRow>[];
  emptyMessage?: string;
  onRowClick?: (row: TRow) => void;
  showQuickFilter?: boolean;
  quickFilterPlaceholder?: string;
}

export default function Grid<TRow extends { id: string }>({
  id,
  rowData,
  columnDefs,
  emptyMessage = 'No rows to display.',
  onRowClick,
  showQuickFilter = false,
  quickFilterPlaceholder = 'Search in grid',
}: GridProps<TRow>) {
  const [quickFilter, setQuickFilter] = useState('');
  const normalizedFilter = quickFilter.trim().toLowerCase();
  const filteredRows = useMemo(() => {
    if (!normalizedFilter) {
      return rowData;
    }

    return rowData.filter((row) =>
      columnDefs.some((column) =>
        getSearchableCellValue(row, column)
          .toLowerCase()
          .includes(normalizedFilter),
      ),
    );
  }, [columnDefs, normalizedFilter, rowData]);

  const effectiveEmptyMessage =
    normalizedFilter.length > 0
      ? 'No matching rows found.'
      : emptyMessage;

  return (
    <div className="space-y-4">
      {showQuickFilter && (
        <div className="max-w-md">
          <label className="block">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.14em] text-[#6b7b8f]">
              Search in grid
            </span>
            <input
              value={quickFilter}
              onChange={(event) => setQuickFilter(event.target.value)}
              placeholder={quickFilterPlaceholder}
              className="h-[46px] w-full rounded-[12px] border border-[rgba(29,111,165,0.14)] bg-white px-4 text-[15px] font-medium text-[#223042] shadow-[0_10px_24px_rgba(15,23,42,0.05)] outline-none transition placeholder:text-[#8a98aa] focus:border-[rgba(29,111,165,0.35)] focus:ring-2 focus:ring-[rgba(29,111,165,0.12)]"
            />
          </label>
        </div>
      )}

      {filteredRows.length === 0 ? (
        <p>{effectiveEmptyMessage}</p>
      ) : (
        <table id={id}>
          <thead>
            <tr>
              {columnDefs.map((column) => (
                <th key={column.headerName} scope="col">
                  {column.headerName}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredRows.map((row) => (
              <tr
                key={row.id}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
                onKeyDown={
                  onRowClick
                    ? (event) => {
                        if (event.key === 'Enter' || event.key === ' ') {
                          event.preventDefault();
                          onRowClick(row);
                        }
                      }
                    : undefined
                }
                tabIndex={onRowClick ? 0 : undefined}
              >
                {columnDefs.map((column) => (
                  <td key={`${row.id}-${column.headerName}`}>
                    {resolveCellValue(row, column)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

function resolveCellValue<TRow extends { id: string }>(
  row: TRow,
  column: GridColumnDef<TRow>,
) {
  if (column.cellRenderer) {
    return column.cellRenderer(row);
  }

  if (column.valueGetter) {
    return column.valueGetter(row);
  }

  if (column.field) {
    return String(row[column.field] ?? '');
  }

  return '';
}

function getSearchableCellValue<TRow extends { id: string }>(
  row: TRow,
  column: GridColumnDef<TRow>,
) {
  if (column.valueGetter) {
    return String(column.valueGetter(row) ?? '');
  }

  if (column.field) {
    return String(row[column.field] ?? '');
  }

  return '';
}

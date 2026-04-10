import { useMemo } from 'react';
import type { ReactNode } from 'react';
import GridSearchInput from './GridSearchInput';
import { resolveCellValue } from './helpers/gridCellValue';
import { matchesGridQuickFilter } from './helpers/gridQuickFilter';
import useGridQuickFilter from './hooks/useGridQuickFilter';

export interface GridColumnDef<TRow> {
  field?: keyof TRow;
  headerName: string;
  valueGetter?: (row: TRow) => ReactNode;
  cellRenderer?: (row: TRow) => ReactNode;
  searchable?: boolean;
  searchValueGetter?: (row: TRow) => ReactNode;
}

interface GridProps<TRow extends { id: string }> {
  id: string;
  rowData: TRow[];
  columnDefs: GridColumnDef<TRow>[];
  emptyMessage?: string;
  onRowClick?: (row: TRow) => void;
  quickFilterPlaceholder?: string;
  showQuickFilter?: boolean;
}

export default function Grid<TRow extends { id: string }>({
  id,
  rowData,
  columnDefs,
  emptyMessage = 'No rows to display.',
  onRowClick,
  quickFilterPlaceholder = 'Search grid rows',
  showQuickFilter = true,
}: GridProps<TRow>) {
  const { quickFilterText, setQuickFilterText, debouncedQuickFilterText } =
    useGridQuickFilter();

  const visibleRows = useMemo(() => {
    if (!debouncedQuickFilterText) {
      return rowData;
    }

    return rowData.filter((row) =>
      matchesGridQuickFilter(row, columnDefs, debouncedQuickFilterText),
    );
  }, [columnDefs, debouncedQuickFilterText, rowData]);

  return (
    <>
      {showQuickFilter && (
        <GridSearchInput
          value={quickFilterText}
          onChange={setQuickFilterText}
          placeholder={quickFilterPlaceholder}
        />
      )}

      {visibleRows.length === 0 ? (
        <p>{emptyMessage}</p>
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
            {visibleRows.map((row) => (
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
    </>
  );
}

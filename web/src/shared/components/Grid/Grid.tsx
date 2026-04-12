import { useMemo } from 'react';
import type { ReactNode } from 'react';
import GridSearchInput from './GridSearchInput';
import { resolveCellValue } from './helpers/gridCellValue';
import { matchesGridQuickFilter } from './helpers/gridQuickFilter';
import useGridQuickFilter from './hooks/useGridQuickFilter';
import Button from '../Button/Button';

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
  onRemove?: (row: TRow) => void;
  quickFilterPlaceholder?: string;
  showQuickFilter?: boolean;
}

export default function Grid<TRow extends { id: string }>({
  id,
  rowData,
  columnDefs,
  emptyMessage = 'No rows to display.',
  onRowClick,
  onRemove,
  quickFilterPlaceholder = 'Search grid rows',
  showQuickFilter = true,
}: GridProps<TRow>) {
  const { quickFilterText, setQuickFilterText, debouncedQuickFilterText } =
    useGridQuickFilter();

  const allColumnDefs = useMemo<GridColumnDef<TRow>[]>(() => {
    if (!onRemove) return columnDefs;
    return [
      ...columnDefs,
      {
        headerName: 'Actions',
        searchable: false,
        cellRenderer: (row) => (
          <Button
            type="button"
            onClick={(e) => { e.stopPropagation(); onRemove(row); }}
            className="text-sm text-[#dc2626] transition hover:text-[#b91c1c]"
          >
            Remove
          </Button>
        ),
      },
    ];
  }, [columnDefs, onRemove]);

  const visibleRows = useMemo(() => {
    if (!debouncedQuickFilterText) {
      return rowData;
    }

    return rowData.filter((row) =>
      matchesGridQuickFilter(row, allColumnDefs, debouncedQuickFilterText),
    );
  }, [allColumnDefs, debouncedQuickFilterText, rowData]);

  return (
    <div className="w-full space-y-3">
      {showQuickFilter && (
        <GridSearchInput
          value={quickFilterText}
          onChange={setQuickFilterText}
          placeholder={quickFilterPlaceholder}
        />
      )}

      {visibleRows.length === 0 ? (
        <p className="rounded-[8px] border border-[#e5e7eb] bg-white px-4 py-8 text-center text-sm text-[rgba(1,1,1,0.4)]">
          {emptyMessage}
        </p>
      ) : (
        <div className="overflow-hidden rounded-[8px] border border-[#e5e7eb] bg-white">
          <table id={id} className="w-full">
            <thead>
              <tr className="border-b border-[#e5e7eb]">
                {allColumnDefs.map((column) => (
                  <th
                    key={column.headerName}
                    scope="col"
                    className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[rgba(1,1,1,0.4)]"
                  >
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
                  className={[
                    'border-b border-[#e5e7eb] last:border-b-0 transition-colors',
                    onRowClick ? 'cursor-pointer hover:bg-[#f6f8fc] focus:bg-[#f6f8fc] outline-none' : '',
                  ].join(' ')}
                >
                  {allColumnDefs.map((column) => (
                    <td
                      key={`${row.id}-${column.headerName}`}
                      className="px-4 py-2.5 text-sm text-[rgba(1,1,1,0.72)]"
                    >
                      {resolveCellValue(row, column)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

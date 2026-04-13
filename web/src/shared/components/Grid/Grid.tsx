import { useMemo, useState } from 'react';
import type { ReactNode } from 'react';

import GridPagination from './GridPagination';
import GridSearchInput from './GridSearchInput';
import GridTable from './GridTable';
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
  onRemove?: (row: TRow) => void;
  quickFilterPlaceholder?: string;
  showQuickFilter?: boolean;
  paginate?: boolean;
  pageSize?: number;
}

const DEFAULT_PAGE_SIZE = 5;
const MAX_PAGINATION_BUTTONS = 5;

export default function Grid<TRow extends { id: string }>({
  id,
  rowData,
  columnDefs,
  emptyMessage = 'No rows to display.',
  onRowClick,
  onRemove,
  quickFilterPlaceholder = 'Search grid rows',
  showQuickFilter = true,
  paginate = false,
  pageSize = DEFAULT_PAGE_SIZE,
}: GridProps<TRow>) {
  const { quickFilterText, setQuickFilterText, debouncedQuickFilterText } =
    useGridQuickFilter();
  const [currentPage, setCurrentPage] = useState(1);

  const visibleRows = useMemo(() => {
    if (!debouncedQuickFilterText) {
      return rowData;
    }

    return rowData.filter((row) =>
      matchesGridQuickFilter(row, columnDefs, debouncedQuickFilterText),
    );
  }, [columnDefs, debouncedQuickFilterText, rowData]);

  const totalPages = paginate ? Math.max(1, Math.ceil(visibleRows.length / pageSize)) : 1;
  const safePage = Math.min(currentPage, totalPages);
  const paginatedRows = paginate
    ? visibleRows.slice((safePage - 1) * pageSize, safePage * pageSize)
    : visibleRows;

  const paginationStart = Math.max(
    1,
    Math.min(
      safePage - Math.floor(MAX_PAGINATION_BUTTONS / 2),
      totalPages - MAX_PAGINATION_BUTTONS + 1,
    ),
  );
  const paginationEnd = Math.min(totalPages, paginationStart + MAX_PAGINATION_BUTTONS - 1);
  const paginationPages = useMemo(
    () =>
      Array.from(
        { length: paginationEnd - paginationStart + 1 },
        (_, index) => paginationStart + index,
      ),
    [paginationEnd, paginationStart],
  );

  return (
    <div className="w-full">
      <div className="overflow-hidden rounded-[5px] border border-[rgba(1,1,1,0.1)] bg-white">
        {showQuickFilter && (
          <div className="px-[16px] pt-[16px]">
            <GridSearchInput
              value={quickFilterText}
              onChange={setQuickFilterText}
              placeholder={quickFilterPlaceholder}
            />
          </div>
        )}

        {paginatedRows.length === 0 ? (
          <p className="px-[16px] py-10 text-sm text-[rgba(1,1,1,0.4)]">
            {emptyMessage}
          </p>
        ) : (
          <div className="overflow-x-auto px-[16px] pb-0 pt-[14px]">
            <GridTable
              id={id}
              rows={paginatedRows}
              columnDefs={columnDefs}
              onRowClick={onRowClick}
              onRemove={onRemove}
            />
          </div>
        )}

        {paginate && totalPages > 1 && (
          <GridPagination
            currentPage={safePage}
            totalPages={totalPages}
            pages={paginationPages}
            onPrev={() => setCurrentPage((page) => Math.max(1, page - 1))}
            onPage={(page) => setCurrentPage(page)}
            onNext={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
          />
        )}
      </div>
    </div>
  );
}

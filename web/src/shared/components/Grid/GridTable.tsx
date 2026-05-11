import Button from '../Button/Button';
import { resolveCellValue } from './helpers/gridCellValue';
import type { GridColumnDef } from './Grid';

interface GridTableProps<TRow extends { id: string }> {
  id: string;
  rows: TRow[];
  columnDefs: GridColumnDef<TRow>[];
  deleteButtonLabel?: string;
  onDelete?: (row: TRow) => void;
  onRowClick?: (row: TRow) => void;
  onRemove?: (row: TRow) => void;
}

export default function GridTable<TRow extends { id: string }>({
  id,
  rows,
  columnDefs,
  deleteButtonLabel,
  onDelete,
  onRowClick,
  onRemove,
}: GridTableProps<TRow>) {
  const allColumnDefs = [
    ...columnDefs,
    ...(onRemove ? [buildRemoveAction(onRemove)] : []),
    ...(onDelete ? [buildDeleteAction(onDelete, deleteButtonLabel)] : []),
  ];

  return (
    <table id={id} className="w-full">
      <thead>
        <tr className="border-b border-line-brand">
          {allColumnDefs.map((column, columnIndex) => (
            <th
              key={`${column.headerName}-${columnIndex}`}
              scope="col"
              className="px-3 py-3 text-left text-[18px] font-bold tracking-[0.01em] text-brand-accent"
            >
              {column.headerName}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
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
              'border-b border-[rgba(0,0,0,0.1)] last:border-b-0 transition-colors',
              onRowClick ? 'cursor-pointer hover:bg-surface-muted focus:bg-surface-muted outline-none' : '',
            ].join(' ')}
          >
            {allColumnDefs.map((column, columnIndex) => (
              <td
                key={`${row.id}-${column.headerName}-${columnIndex}`}
                className="px-3 py-3 text-base text-ink-subtle"
              >
                {resolveCellValue(row, column)}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function buildRemoveAction<TRow extends { id: string }>(
  onRemove: (row: TRow) => void,
): GridColumnDef<TRow> {
  return {
    headerName: 'Actions',
    searchable: false,
    cellRenderer: (row) => (
      <Button
        type="button"
        onClick={(event) => {
          event.stopPropagation();
          onRemove(row);
        }}
        className="text-sm text-destructive transition hover:text-destructive-strong"
      >
        Remove
      </Button>
    ),
  };
}

function buildDeleteAction<TRow extends { id: string }>(
  onDelete: (row: TRow) => void,
  deleteButtonLabel = 'Delete',
): GridColumnDef<TRow> {
  return {
    headerName: 'Actions',
    searchable: false,
    cellRenderer: (row) => (
      <Button
        type="button"
        onClick={(event) => {
          event.stopPropagation();
          onDelete(row);
        }}
        className="rounded-md bg-destructive-text px-3 py-1.5 text-xs font-semibold text-white transition hover:opacity-90"
      >
        {deleteButtonLabel}
      </Button>
    ),
  };
}

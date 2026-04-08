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
}

export default function Grid<TRow extends { id: string }>({
  id,
  rowData,
  columnDefs,
  emptyMessage = 'No rows to display.',
  onRowClick,
}: GridProps<TRow>) {
  if (rowData.length === 0) {
    return <p>{emptyMessage}</p>;
  }

  return (
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
        {rowData.map((row) => (
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

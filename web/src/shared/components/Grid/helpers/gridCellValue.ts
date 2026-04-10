import type { ReactNode } from 'react';
import type { GridColumnDef } from '../Grid';

export function resolveCellValue<TRow extends { id: string }>(
  row: TRow,
  column: GridColumnDef<TRow>,
): ReactNode {
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

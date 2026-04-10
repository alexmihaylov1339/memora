import { isBoolean, isNumber, isString } from '@shared/utils';
import type { GridColumnDef } from '../Grid';

export function matchesGridQuickFilter<TRow extends { id: string }>(
  row: TRow,
  columnDefs: GridColumnDef<TRow>[],
  quickFilterText: string,
) {
  return columnDefs.some((column) => {
    if (column.searchable === false) {
      return false;
    }

    return resolveSearchValue(row, column)
      .toLowerCase()
      .includes(quickFilterText);
  });
}

function resolveSearchValue<TRow extends { id: string }>(
  row: TRow,
  column: GridColumnDef<TRow>,
) {
  if (column.searchValueGetter) {
    return stringifyGridValue(column.searchValueGetter(row));
  }

  if (column.valueGetter) {
    return stringifyGridValue(column.valueGetter(row));
  }

  if (column.field) {
    return stringifyGridValue(row[column.field] as unknown);
  }

  return '';
}

function stringifyGridValue(value: unknown): string {
  if (value == null || isBoolean(value)) {
    return '';
  }

  if (isString(value) || isNumber(value)) {
    return String(value);
  }

  if (Array.isArray(value)) {
    return value.map((item) => stringifyGridValue(item)).join(' ');
  }

  return '';
}

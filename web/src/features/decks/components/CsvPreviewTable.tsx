import { useMemo } from 'react';

import { Grid, type GridColumnDef } from '@shared/components';

import type { ParsedRow, SkippedRow } from '../utils';

const PREVIEW_ROW_COUNT = 10;

interface PreviewRow {
  id: string;
  front: string;
  back: string;
}

const PREVIEW_COLUMN_DEFS: GridColumnDef<PreviewRow>[] = [
  { field: 'front', headerName: 'Front' },
  { field: 'back', headerName: 'Back' },
];

interface CsvPreviewTableProps {
  rows: ParsedRow[];
  skipped: SkippedRow[];
}

export function CsvPreviewTable({ rows, skipped }: CsvPreviewTableProps) {
  const previewRows = useMemo<PreviewRow[]>(
    () =>
      rows.slice(0, PREVIEW_ROW_COUNT).map((row, index) => ({
        id: String(index),
        front: row.front,
        back: row.back,
      })),
    [rows],
  );

  const remainingCount = rows.length - previewRows.length;
  const rowLabel = rows.length === 1 ? 'card' : 'cards';
  const skippedLabel = skipped.length === 1 ? 'row' : 'rows';

  return (
    <div>
      <p className="mb-2 text-sm text-ink-muted">
        {rows.length} {rowLabel} ready to import
        {skipped.length > 0 ? `, ${skipped.length} ${skippedLabel} skipped.` : '.'}
      </p>

      {rows.length > 0 && (
        <>
          <Grid
            id="csv-preview-grid"
            rowData={previewRows}
            columnDefs={PREVIEW_COLUMN_DEFS}
            showQuickFilter={false}
            emptyMessage="No valid rows found."
          />
          {remainingCount > 0 && (
            <p className="mt-1 text-xs text-ink-muted">…and {remainingCount} more</p>
          )}
        </>
      )}

      {skipped.length > 0 && (
        <div className="mt-3">
          <p className="mb-1 text-xs font-semibold text-ink-muted">Skipped rows:</p>
          <ul className="space-y-1">
            {skipped.map((skippedRow) => (
              <li key={skippedRow.row} className="text-xs text-destructive-text">
                Row {skippedRow.row}: {skippedRow.reason}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

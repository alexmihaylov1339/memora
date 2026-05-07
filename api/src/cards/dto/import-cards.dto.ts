import type { SkippedRow } from '../csv/csv-parser';

export interface SkippedRowDto {
  row: number;
  reason: string;
}

export interface ImportCardsResponseDto {
  created: number;
  skipped: SkippedRowDto[];
}

export function serializeSkippedRow(skipped: SkippedRow): SkippedRowDto {
  return { row: skipped.row, reason: skipped.reason };
}

export function serializeImportCardsResponse(
  created: number,
  skipped: SkippedRow[],
): ImportCardsResponseDto {
  return {
    created,
    skipped: skipped.map(serializeSkippedRow),
  };
}

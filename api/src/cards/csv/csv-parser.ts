import { parse } from 'csv-parse/sync';

import { BASIC_CARD_FIELD_MAX_LENGTH } from '../card-errors';

export interface ParsedRow {
  front: string;
  back: string;
}

export interface SkippedRow {
  row: number;
  reason: string;
}

export interface CsvParseResult {
  rows: ParsedRow[];
  skipped: SkippedRow[];
}

const HEADER_ROW_COUNT = 1;
const FILE_ROW_NUMBER_OFFSET = 1;
const REQUIRED_COLUMN_COUNT = 2;
const FRONT_COLUMN_INDEX = 0;
const BACK_COLUMN_INDEX = 1;

const HEADER_KEYWORDS = new Set([
  'front',
  'back',
  'question',
  'answer',
  'term',
  'definition',
]);

const SKIP_REASONS = {
  missingBack: 'missing back side',
  emptyFront: 'empty front',
  emptyBack: 'empty back',
  frontTooLong: `front too long (max ${BASIC_CARD_FIELD_MAX_LENGTH} chars)`,
  backTooLong: `back too long (max ${BASIC_CARD_FIELD_MAX_LENGTH} chars)`,
} as const;

function isHeaderRow(row: string[]): boolean {
  const firstCell = (row[FRONT_COLUMN_INDEX] ?? '').trim().toLowerCase();
  return HEADER_KEYWORDS.has(firstCell);
}

function isCompletelyEmpty(row: string[]): boolean {
  return row.every((cell) => !cell?.trim());
}

export function parseCsv(buffer: Buffer): CsvParseResult {
  const rawRows: string[][] = parse(buffer, {
    skip_empty_lines: true,
    relax_column_count: true,
    trim: false,
  });

  if (rawRows.length === 0) {
    return { rows: [], skipped: [] };
  }

  const hasHeader = isHeaderRow(rawRows[FRONT_COLUMN_INDEX]);
  const dataStartIndex = hasHeader ? HEADER_ROW_COUNT : 0;

  const rows: ParsedRow[] = [];
  const skipped: SkippedRow[] = [];

  for (let i = dataStartIndex; i < rawRows.length; i++) {
    const rawRow = rawRows[i];
    const fileRowNumber = i + FILE_ROW_NUMBER_OFFSET;

    if (isCompletelyEmpty(rawRow)) {
      continue;
    }

    if (rawRow.length < REQUIRED_COLUMN_COUNT) {
      skipped.push({ row: fileRowNumber, reason: SKIP_REASONS.missingBack });
      continue;
    }

    const front = rawRow[FRONT_COLUMN_INDEX].trim();
    const back = rawRow[BACK_COLUMN_INDEX].trim();

    if (!front) {
      skipped.push({ row: fileRowNumber, reason: SKIP_REASONS.emptyFront });
      continue;
    }

    if (!back) {
      skipped.push({ row: fileRowNumber, reason: SKIP_REASONS.emptyBack });
      continue;
    }

    if (front.length > BASIC_CARD_FIELD_MAX_LENGTH) {
      skipped.push({ row: fileRowNumber, reason: SKIP_REASONS.frontTooLong });
      continue;
    }

    if (back.length > BASIC_CARD_FIELD_MAX_LENGTH) {
      skipped.push({ row: fileRowNumber, reason: SKIP_REASONS.backTooLong });
      continue;
    }

    rows.push({ front, back });
  }

  return { rows, skipped };
}

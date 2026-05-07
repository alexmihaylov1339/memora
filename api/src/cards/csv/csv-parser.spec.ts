import { BASIC_CARD_FIELD_MAX_LENGTH } from '../card-errors';
import { parseCsv } from './csv-parser';

function toBuffer(...rows: string[]): Buffer {
  return Buffer.from(rows.join('\n'));
}

const OVER_LIMIT = 'a'.repeat(BASIC_CARD_FIELD_MAX_LENGTH + 1);

describe('parseCsv', () => {
  describe('header detection', () => {
    it('skips a Front,Back header row and does not create a card for it', () => {
      const result = parseCsv(toBuffer('Front,Back', 'Hallo,Hello'));

      expect(result.rows).toHaveLength(1);
      expect(result.rows[0]).toEqual({ front: 'Hallo', back: 'Hello' });
    });

    it('treats the first row as card data when it does not match a header keyword', () => {
      const result = parseCsv(toBuffer('Hallo,Hello', 'Danke,Thank you'));

      expect(result.rows).toHaveLength(2);
      expect(result.rows[0]).toEqual({ front: 'Hallo', back: 'Hello' });
    });

    it('skips a Question,Answer header row', () => {
      const result = parseCsv(toBuffer('Question,Answer', 'What is 2+2?,4'));

      expect(result.rows).toHaveLength(1);
      expect(result.rows[0]).toEqual({ front: 'What is 2+2?', back: '4' });
    });

    it('skips a Term,Definition header row', () => {
      const result = parseCsv(toBuffer('Term,Definition', 'Osmosis,Movement of water'));

      expect(result.rows).toHaveLength(1);
      expect(result.rows[0]).toEqual({ front: 'Osmosis', back: 'Movement of water' });
    });

    it('skips a header regardless of casing', () => {
      const result = parseCsv(toBuffer('FRONT,BACK', 'Hallo,Hello'));

      expect(result.rows).toHaveLength(1);
    });

    it('returns no rows and no skipped entries when the file contains only a header', () => {
      const result = parseCsv(toBuffer('Front,Back'));

      expect(result.rows).toHaveLength(0);
      expect(result.skipped).toHaveLength(0);
    });
  });

  describe('whitespace trimming', () => {
    it('trims leading and trailing whitespace from front and back', () => {
      const result = parseCsv(toBuffer('  Hello  ,  World  '));

      expect(result.rows[0]).toEqual({ front: 'Hello', back: 'World' });
    });

    it('trims tab characters surrounding field values', () => {
      const result = parseCsv(toBuffer('\tWord\t,\tTranslation\t'));

      expect(result.rows[0]).toEqual({ front: 'Word', back: 'Translation' });
    });
  });

  describe('empty row handling', () => {
    it('silently ignores a row where both columns are empty', () => {
      const result = parseCsv(toBuffer('Good,Row', ',', 'Also,Good'));

      expect(result.rows).toHaveLength(2);
      expect(result.skipped).toHaveLength(0);
    });

    it('silently ignores a row where both columns are whitespace-only', () => {
      const result = parseCsv(toBuffer('Good,Row', '   ,   ', 'Also,Good'));

      expect(result.rows).toHaveLength(2);
      expect(result.skipped).toHaveLength(0);
    });

    it('returns empty rows and skipped when the buffer is empty', () => {
      const result = parseCsv(Buffer.from(''));

      expect(result.rows).toHaveLength(0);
      expect(result.skipped).toHaveLength(0);
    });
  });

  describe('row validation — missing columns', () => {
    it('skips a row with only one column with reason "missing back side"', () => {
      const result = parseCsv(toBuffer('OnlyFront'));

      expect(result.rows).toHaveLength(0);
      expect(result.skipped).toEqual([{ row: 1, reason: 'missing back side' }]);
    });
  });

  describe('row validation — empty field values', () => {
    it('skips a row where front is empty with reason "empty front"', () => {
      const result = parseCsv(toBuffer(',Back value'));

      expect(result.rows).toHaveLength(0);
      expect(result.skipped).toEqual([{ row: 1, reason: 'empty front' }]);
    });

    it('skips a row where front is whitespace-only with reason "empty front"', () => {
      const result = parseCsv(toBuffer('   ,Back value'));

      expect(result.rows).toHaveLength(0);
      expect(result.skipped).toEqual([{ row: 1, reason: 'empty front' }]);
    });

    it('skips a row where back is empty with reason "empty back"', () => {
      const result = parseCsv(toBuffer('Front value,'));

      expect(result.rows).toHaveLength(0);
      expect(result.skipped).toEqual([{ row: 1, reason: 'empty back' }]);
    });

    it('skips a row where back is whitespace-only with reason "empty back"', () => {
      const result = parseCsv(toBuffer('Front value,   '));

      expect(result.rows).toHaveLength(0);
      expect(result.skipped).toEqual([{ row: 1, reason: 'empty back' }]);
    });
  });

  describe('row validation — field length limits', () => {
    it(`skips a row where front exceeds ${BASIC_CARD_FIELD_MAX_LENGTH} chars`, () => {
      const result = parseCsv(toBuffer(`${OVER_LIMIT},Back`));

      expect(result.rows).toHaveLength(0);
      expect(result.skipped[0]?.reason).toBe(
        `front too long (max ${BASIC_CARD_FIELD_MAX_LENGTH} chars)`,
      );
    });

    it(`skips a row where back exceeds ${BASIC_CARD_FIELD_MAX_LENGTH} chars`, () => {
      const result = parseCsv(toBuffer(`Card front,${OVER_LIMIT}`));

      expect(result.rows).toHaveLength(0);
      expect(result.skipped[0]?.reason).toBe(
        `back too long (max ${BASIC_CARD_FIELD_MAX_LENGTH} chars)`,
      );
    });

    it(`accepts a row where front and back are exactly ${BASIC_CARD_FIELD_MAX_LENGTH} chars`, () => {
      const atLimit = 'a'.repeat(BASIC_CARD_FIELD_MAX_LENGTH);
      const result = parseCsv(toBuffer(`${atLimit},${atLimit}`));

      expect(result.rows).toHaveLength(1);
      expect(result.skipped).toHaveLength(0);
    });
  });

  describe('RFC 4180 quoted values', () => {
    it('parses quoted front values that contain commas', () => {
      const result = parseCsv(toBuffer('"Hello, world",Goodbye'));

      expect(result.rows[0]).toEqual({ front: 'Hello, world', back: 'Goodbye' });
    });

    it('parses quoted back values that contain commas', () => {
      const result = parseCsv(toBuffer('Hello,"Goodbye, friend"'));

      expect(result.rows[0]).toEqual({ front: 'Hello', back: 'Goodbye, friend' });
    });
  });

  describe('row numbering', () => {
    it('reports 1-based file row numbers that include the header in the count', () => {
      // header=row1, valid=row2, invalid=row3, valid rows 4-6
      const result = parseCsv(
        toBuffer(
          'Front,Back',
          'Valid,Row',
          'OnlyFront',
          'Another,Valid',
          'Yet,Another',
          'Last,One',
        ),
      );

      expect(result.skipped).toEqual([{ row: 3, reason: 'missing back side' }]);
      expect(result.rows).toHaveLength(4);
    });

    it('reports correct file row numbers when there is no header', () => {
      // invalid=row2, invalid=row4
      const result = parseCsv(
        toBuffer('Valid,Row', 'OnlyFront', 'Valid,Again', 'AlsoOnlyFront'),
      );

      expect(result.skipped).toEqual([
        { row: 2, reason: 'missing back side' },
        { row: 4, reason: 'missing back side' },
      ]);
    });
  });

  describe('mixed valid and invalid rows', () => {
    it('returns correct counts when some rows are valid and others are skipped', () => {
      const result = parseCsv(
        toBuffer(
          'Front,Back',
          'Good,One',
          'Good,Two',
          'Good,Three',
          ',EmptyFront',
          'Good,Four',
          'Good,Five',
          'Good,Six',
          'Good,Seven',
          'MissingBack',
          'Good,Eight',
        ),
      );

      expect(result.rows).toHaveLength(8);
      expect(result.skipped).toHaveLength(2);
    });

    it('returns empty rows with populated skipped list when all rows are invalid', () => {
      const result = parseCsv(toBuffer('OnlyFront', ',', 'AlsoOnlyFront'));

      expect(result.rows).toHaveLength(0);
      expect(result.skipped).toHaveLength(2);
    });
  });
});

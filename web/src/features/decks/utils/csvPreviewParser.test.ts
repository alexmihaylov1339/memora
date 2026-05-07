import { parseCsvText } from './csvPreviewParser';

const BASIC_CARD_FIELD_MAX_LENGTH = 2000;
const AT_LIMIT = 'x'.repeat(BASIC_CARD_FIELD_MAX_LENGTH);
const OVER_LIMIT = 'x'.repeat(BASIC_CARD_FIELD_MAX_LENGTH + 1);

describe('parseCsvText', () => {
  describe('header detection', () => {
    it('skips a "Front,Back" header row and returns data rows only', () => {
      const result = parseCsvText('Front,Back\nHallo,Hello');
      expect(result.rows).toEqual([{ front: 'Hallo', back: 'Hello' }]);
      expect(result.skipped).toHaveLength(0);
    });

    it('includes row 1 as data when it does not match header keywords', () => {
      const result = parseCsvText('Hallo,Hello');
      expect(result.rows).toEqual([{ front: 'Hallo', back: 'Hello' }]);
    });

    it('skips "Question,Answer" header', () => {
      const result = parseCsvText('Question,Answer\nWer,Who');
      expect(result.rows).toEqual([{ front: 'Wer', back: 'Who' }]);
    });

    it('skips "Term,Definition" header', () => {
      const result = parseCsvText('Term,Definition\nHund,Dog');
      expect(result.rows).toEqual([{ front: 'Hund', back: 'Dog' }]);
    });

    it('skips header keyword regardless of casing', () => {
      const result = parseCsvText('FRONT,BACK\nBuch,Book');
      expect(result.rows).toEqual([{ front: 'Buch', back: 'Book' }]);
    });

    it('skips header with surrounding whitespace', () => {
      const result = parseCsvText('  front  ,back\nBaum,Tree');
      expect(result.rows).toEqual([{ front: 'Baum', back: 'Tree' }]);
    });
  });

  describe('whitespace trimming', () => {
    it('trims leading and trailing whitespace from front and back', () => {
      const result = parseCsvText('  spielen  ,  to play  ');
      expect(result.rows).toEqual([{ front: 'spielen', back: 'to play' }]);
    });
  });

  describe('empty row handling', () => {
    it('silently skips fully empty rows without adding to skipped list', () => {
      const result = parseCsvText('Hallo,Hello\n\nTschüss,Goodbye');
      expect(result.rows).toHaveLength(2);
      expect(result.skipped).toHaveLength(0);
    });

    it('silently skips rows where all columns are whitespace-only', () => {
      const result = parseCsvText('Hallo,Hello\n ,  \nTschüss,Goodbye');
      expect(result.rows).toHaveLength(2);
      expect(result.skipped).toHaveLength(0);
    });
  });

  describe('invalid row handling', () => {
    it('skips a row with fewer than two columns with reason "missing back side"', () => {
      const result = parseCsvText('Hallo');
      expect(result.rows).toHaveLength(0);
      expect(result.skipped).toEqual([{ row: 1, reason: 'missing back side' }]);
    });

    it('skips a row with empty front with reason "empty front"', () => {
      const result = parseCsvText(',Hello');
      expect(result.rows).toHaveLength(0);
      expect(result.skipped).toEqual([{ row: 1, reason: 'empty front' }]);
    });

    it('skips a row with empty back with reason "empty back"', () => {
      const result = parseCsvText('Hallo,');
      expect(result.rows).toHaveLength(0);
      expect(result.skipped).toEqual([{ row: 1, reason: 'empty back' }]);
    });

    it('accepts a front value exactly at the length limit', () => {
      const result = parseCsvText(`${AT_LIMIT},Hello`);
      expect(result.rows).toHaveLength(1);
      expect(result.skipped).toHaveLength(0);
    });

    it('skips a row with front over the length limit', () => {
      const result = parseCsvText(`${OVER_LIMIT},Hello`);
      expect(result.rows).toHaveLength(0);
      expect(result.skipped[0].reason).toMatch(/front too long/);
    });

    it('accepts a back value exactly at the length limit', () => {
      const result = parseCsvText(`Card front,${AT_LIMIT}`);
      expect(result.rows).toHaveLength(1);
      expect(result.skipped).toHaveLength(0);
    });

    it('skips a row with back over the length limit', () => {
      const result = parseCsvText(`Card front,${OVER_LIMIT}`);
      expect(result.rows).toHaveLength(0);
      expect(result.skipped[0].reason).toMatch(/back too long/);
    });
  });

  describe('RFC 4180 quoted values', () => {
    it('parses quoted front with embedded comma correctly', () => {
      const result = parseCsvText('"Hello, world",Goodbye');
      expect(result.rows).toEqual([{ front: 'Hello, world', back: 'Goodbye' }]);
    });
  });

  describe('row numbering', () => {
    it('reports 1-based file row number for skipped rows without header', () => {
      const csv = ['Hallo,Hello', 'only-one-column', 'Tschüss,Goodbye'].join(
        '\n',
      );
      const result = parseCsvText(csv);
      expect(result.skipped[0].row).toBe(2);
    });

    it('reports 1-based file row number for skipped rows with header', () => {
      const csv = [
        'Front,Back',
        'Hallo,Hello',
        'only-one-column',
        'Tschüss,Goodbye',
      ].join('\n');
      const result = parseCsvText(csv);
      expect(result.skipped[0].row).toBe(3);
    });
  });

  describe('mixed valid and invalid rows', () => {
    it('returns correct rows and skipped counts for mixed input', () => {
      const csv = [
        'Hallo,Hello',
        'only-one-column',
        'Baum,Tree',
        ',empty-front',
        'Hund,Dog',
      ].join('\n');
      const result = parseCsvText(csv);
      expect(result.rows).toHaveLength(3);
      expect(result.skipped).toHaveLength(2);
    });

    it('returns empty rows array when all rows are skipped', () => {
      const csv = ['only-one', 'also-one'].join('\n');
      const result = parseCsvText(csv);
      expect(result.rows).toHaveLength(0);
      expect(result.skipped).toHaveLength(2);
    });
  });
});

import { BadRequestException } from '@nestjs/common';
import {
  validateCardId,
  validateCreateCardInput,
  validateUpdateCardInput,
} from './card-validation';

describe('card-validation', () => {
  describe('validateCardId', () => {
    it('returns trimmed id for valid values', () => {
      expect(validateCardId('  card-1  ')).toBe('card-1');
    });

    it('throws when id is empty', () => {
      expect(() => validateCardId('   ')).toThrow(BadRequestException);
    });
  });

  describe('validateCreateCardInput', () => {
    it('accepts valid card input', () => {
      expect(() =>
        validateCreateCardInput({
          deckId: 'deck-1',
          kind: 'basic',
          fields: { front: 'Hej', back: 'Hi' },
        }),
      ).not.toThrow();
    });

    it('throws when deckId is missing', () => {
      expect(() =>
        validateCreateCardInput({
          deckId: ' ',
          kind: 'basic',
          fields: { front: 'Hej' },
        }),
      ).toThrow(BadRequestException);
    });

    it('throws when kind is missing', () => {
      expect(() =>
        validateCreateCardInput({
          deckId: 'deck-1',
          kind: ' ',
          fields: { front: 'Hej' },
        }),
      ).toThrow(BadRequestException);
    });

    it('throws when fields is not an object', () => {
      expect(() =>
        validateCreateCardInput({
          deckId: 'deck-1',
          kind: 'basic',
          fields: [] as unknown as Record<string, unknown>,
        }),
      ).toThrow(BadRequestException);
    });
  });

  describe('validateUpdateCardInput', () => {
    it('accepts valid partial updates', () => {
      expect(() =>
        validateUpdateCardInput({
          kind: 'basic',
        }),
      ).not.toThrow();
    });

    it('throws when no updatable fields are provided', () => {
      expect(() => validateUpdateCardInput({})).toThrow(BadRequestException);
    });
  });
});

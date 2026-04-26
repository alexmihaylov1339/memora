import { BadRequestException } from '@nestjs/common';
import {
  isSupportedKind,
  normalizeCardFields,
  validateCardFields,
} from './card-kind-registry';

describe('card-kind-registry', () => {
  describe('isSupportedKind', () => {
    it('returns true for supported kinds', () => {
      expect(isSupportedKind('basic')).toBe(true);
    });

    it('returns false for unsupported kinds', () => {
      expect(isSupportedKind('cloze_text')).toBe(false);
      expect(isSupportedKind('')).toBe(false);
    });
  });

  describe('validateCardFields', () => {
    it('accepts valid fields for basic cards', () => {
      expect(() =>
        validateCardFields('basic', { front: 'Hej', back: 'Hi' }),
      ).not.toThrow();
    });

    it('rejects unsupported kinds', () => {
      expect(() =>
        validateCardFields('cloze_text', {
          text: 'Ich {{c1::spiele}} gern Tennis.',
          answer: 'spiele',
        }),
      ).toThrow(BadRequestException);
    });

    it('rejects invalid basic fields', () => {
      expect(() =>
        validateCardFields('basic', { front: '   ', back: 'Hi' }),
      ).toThrow(BadRequestException);
    });
  });

  describe('normalizeCardFields', () => {
    it('returns canonical normalized fields for basic cards', () => {
      expect(
        normalizeCardFields('basic', { front: '  Hej  ', back: '  Hi  ' }),
      ).toEqual({
        front: 'Hej',
        back: 'Hi',
      });
    });
  });
});

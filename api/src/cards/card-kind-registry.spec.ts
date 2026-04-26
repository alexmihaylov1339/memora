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
      expect(isSupportedKind('cloze_text')).toBe(true);
    });

    it('returns false for unsupported kinds', () => {
      expect(isSupportedKind('audio_gap')).toBe(false);
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
        validateCardFields('audio_gap', {
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

    it('accepts valid fields for cloze_text cards', () => {
      expect(() =>
        validateCardFields('cloze_text', {
          text: 'Ich {{c1::spiele}} gern Tennis.',
          answer: 'spiele',
          hint: 'Verb',
        }),
      ).not.toThrow();
    });

    it('rejects cloze_text fields when marker is missing', () => {
      expect(() =>
        validateCardFields('cloze_text', {
          text: 'Ich spiele gern Tennis.',
          answer: 'spiele',
        }),
      ).toThrow(BadRequestException);
    });

    it('rejects cloze_text fields when marker value does not match answer', () => {
      expect(() =>
        validateCardFields('cloze_text', {
          text: 'Ich {{c1::spiele}} gern Tennis.',
          answer: 'lernst',
        }),
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

    it('returns canonical normalized fields for cloze_text cards', () => {
      expect(
        normalizeCardFields('cloze_text', {
          text: '  Ich {{c1::spiele}} gern Tennis.  ',
          answer: '  spiele ',
          hint: ' Verb ',
          ignored: 'value',
        }),
      ).toEqual({
        text: 'Ich {{c1::spiele}} gern Tennis.',
        answer: 'spiele',
        hint: 'Verb',
      });
    });
  });
});

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
          kind: 'basic',
          fields: { front: 'Hej', back: 'Hi' },
        }),
      ).not.toThrow();
    });

    it('throws when kind is missing', () => {
      expect(() =>
        validateCreateCardInput({
          kind: ' ',
          fields: { front: 'Hej' },
        }),
      ).toThrow(BadRequestException);
    });

    it('throws when fields is not an object', () => {
      expect(() =>
        validateCreateCardInput({
          kind: 'basic',
          fields: [] as unknown as Record<string, unknown>,
        }),
      ).toThrow(BadRequestException);
    });

    it('throws when kind is not supported', () => {
      expect(() =>
        validateCreateCardInput({
          kind: 'audio_gap',
          fields: {
            text: 'Ich {{c1::spiele}} gern Tennis.',
            answer: 'spiele',
          },
        }),
      ).toThrow(BadRequestException);
    });

    it('accepts valid cloze_text card input', () => {
      expect(() =>
        validateCreateCardInput({
          kind: 'cloze_text',
          fields: {
            text: 'Ich {{c1::spiele}} gern Tennis.',
            answer: 'spiele',
            hint: 'Verb in present tense',
          },
        }),
      ).not.toThrow();
    });

    it('accepts valid image_audio card input', () => {
      expect(() =>
        validateCreateCardInput({
          kind: 'image_audio',
          fields: {
            label: 'Car',
            imageAsset: {
              path: 'kids-images/user-1/asset-1/car.jpg',
              mimeType: 'image/jpeg',
              size: 2048,
            },
            audioAsset: {
              path: 'kids-audio/user-1/asset-2/car.mp3',
              mimeType: 'audio/mpeg',
              size: 4096,
            },
          },
        }),
      ).not.toThrow();
    });

    it('accepts unique deck IDs on create', () => {
      expect(() =>
        validateCreateCardInput({
          kind: 'basic',
          deckIds: ['deck-1', ' deck-2 '],
          fields: { front: 'Hej', back: 'Hi' },
        }),
      ).not.toThrow();
    });

    it('rejects duplicate deck IDs on create', () => {
      expect(() =>
        validateCreateCardInput({
          kind: 'basic',
          deckIds: ['deck-1', ' deck-1 '],
          fields: { front: 'Hej', back: 'Hi' },
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

    it('throws when provided kind is not supported', () => {
      expect(() =>
        validateUpdateCardInput({
          kind: 'audio_gap',
        }),
      ).toThrow(BadRequestException);
    });

    it('throws when provided fields are invalid for provided kind', () => {
      expect(() =>
        validateUpdateCardInput({
          kind: 'basic',
          fields: { front: 'hello' },
        }),
      ).toThrow(BadRequestException);
    });

    it('accepts cloze_text updates with matching marker and answer', () => {
      expect(() =>
        validateUpdateCardInput({
          kind: 'cloze_text',
          fields: {
            text: 'Wir {{c1::lernen}} Deutsch.',
            answer: 'lernen',
          },
        }),
      ).not.toThrow();
    });

    it('accepts image_audio updates with image and audio assets', () => {
      expect(() =>
        validateUpdateCardInput({
          kind: 'image_audio',
          fields: {
            label: 'Car',
            imageAsset: {
              path: 'kids-images/user-1/asset-1/car.jpg',
              mimeType: 'image/jpeg',
              size: 2048,
            },
            audioAsset: {
              path: 'kids-audio/user-1/asset-2/car.mp3',
              mimeType: 'audio/mpeg',
              size: 4096,
            },
          },
        }),
      ).not.toThrow();
    });

    it('accepts deck-only updates', () => {
      expect(() =>
        validateUpdateCardInput({
          deckIds: ['deck-1', 'deck-2'],
        }),
      ).not.toThrow();
    });

    it('rejects empty deck IDs on update', () => {
      expect(() =>
        validateUpdateCardInput({
          deckIds: ['deck-1', ' '],
        }),
      ).toThrow(BadRequestException);
    });
  });
});

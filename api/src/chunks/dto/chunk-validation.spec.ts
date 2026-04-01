import { BadRequestException } from '@nestjs/common';
import {
  validateChunkId,
  validateCreateChunkInput,
  validateListChunksQuery,
  validateUpdateChunkInput,
} from './chunk-validation';

describe('chunk-validation', () => {
  describe('validateChunkId', () => {
    it('returns trimmed id for valid values', () => {
      expect(validateChunkId('  chunk-1  ')).toBe('chunk-1');
    });

    it('throws when id is empty', () => {
      expect(() => validateChunkId('   ')).toThrow(BadRequestException);
    });
  });

  describe('validateCreateChunkInput', () => {
    it('accepts valid chunk input', () => {
      expect(() =>
        validateCreateChunkInput({
          deckId: 'deck-1',
          title: 'Chunk title',
          cardIds: ['card-1', 'card-2'],
          position: 0,
        }),
      ).not.toThrow();
    });

    it('throws when deckId is missing', () => {
      expect(() =>
        validateCreateChunkInput({
          deckId: '  ',
          title: 'Chunk title',
        }),
      ).toThrow(BadRequestException);
    });

    it('throws when title is missing', () => {
      expect(() =>
        validateCreateChunkInput({
          deckId: 'deck-1',
          title: ' ',
        }),
      ).toThrow(BadRequestException);
    });

    it('throws when cardIds contain empty values', () => {
      expect(() =>
        validateCreateChunkInput({
          deckId: 'deck-1',
          title: 'Chunk title',
          cardIds: ['card-1', '   '],
        }),
      ).toThrow(BadRequestException);
    });

    it('throws when cardIds contain duplicates', () => {
      expect(() =>
        validateCreateChunkInput({
          deckId: 'deck-1',
          title: 'Chunk title',
          cardIds: ['card-1', 'card-1'],
        }),
      ).toThrow(BadRequestException);
    });

    it('throws when position is negative', () => {
      expect(() =>
        validateCreateChunkInput({
          deckId: 'deck-1',
          title: 'Chunk title',
          position: -1,
        }),
      ).toThrow(BadRequestException);
    });
  });

  describe('validateUpdateChunkInput', () => {
    it('accepts valid partial updates', () => {
      expect(() =>
        validateUpdateChunkInput({
          title: 'Updated title',
        }),
      ).not.toThrow();
    });

    it('throws when no updatable fields are provided', () => {
      expect(() => validateUpdateChunkInput({})).toThrow(BadRequestException);
    });

    it('throws when title is empty', () => {
      expect(() =>
        validateUpdateChunkInput({
          title: '  ',
        }),
      ).toThrow(BadRequestException);
    });

    it('throws when cardIds contain empty values', () => {
      expect(() =>
        validateUpdateChunkInput({
          cardIds: ['card-1', ''],
        }),
      ).toThrow(BadRequestException);
    });

    it('throws when cardIds contain duplicates', () => {
      expect(() =>
        validateUpdateChunkInput({
          cardIds: ['card-1', 'card-1'],
        }),
      ).toThrow(BadRequestException);
    });

    it('throws when position is not a non-negative integer', () => {
      expect(() =>
        validateUpdateChunkInput({
          position: 1.5,
        }),
      ).toThrow(BadRequestException);
    });
  });

  describe('validateListChunksQuery', () => {
    it('returns defaults for an empty query', () => {
      expect(validateListChunksQuery({})).toEqual({
        limit: 50,
        offset: 0,
        direction: 'asc',
      });
    });

    it('accepts valid pagination and direction values', () => {
      expect(
        validateListChunksQuery({
          limit: 10,
          offset: 5,
          direction: 'desc',
        }),
      ).toEqual({
        limit: 10,
        offset: 5,
        direction: 'desc',
      });
    });

    it('throws when limit is out of range', () => {
      expect(() => validateListChunksQuery({ limit: 0 })).toThrow(
        BadRequestException,
      );
    });

    it('throws when offset is negative', () => {
      expect(() => validateListChunksQuery({ offset: -1 })).toThrow(
        BadRequestException,
      );
    });

    it('throws when direction is invalid', () => {
      expect(() =>
        validateListChunksQuery({ direction: 'sideways' as 'asc' }),
      ).toThrow(BadRequestException);
    });
  });
});

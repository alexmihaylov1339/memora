import { BadRequestException } from '@nestjs/common';

import {
  validateCreateDeckInput,
  validateUpdateDeckInput,
} from './deck-validation';

describe('deck-validation', () => {
  it('accepts valid create input with kids presentation mode', () => {
    expect(() =>
      validateCreateDeckInput({
        name: 'Kids deck',
        presentationMode: 'kids',
        reviewIntervalHours: [24, 48],
      }),
    ).not.toThrow();
  });

  it('rejects invalid create presentation mode', () => {
    expect(() =>
      validateCreateDeckInput({
        name: 'Kids deck',
        presentationMode: 'cinema',
        reviewIntervalHours: [24, 48],
      }),
    ).toThrow(BadRequestException);
  });

  it('accepts valid update input with standard presentation mode', () => {
    expect(() =>
      validateUpdateDeckInput({
        presentationMode: 'standard',
      }),
    ).not.toThrow();
  });

  it('rejects invalid update presentation mode', () => {
    expect(() =>
      validateUpdateDeckInput({
        presentationMode: 'storybook',
      }),
    ).toThrow(BadRequestException);
  });
});

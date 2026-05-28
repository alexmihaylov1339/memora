import { BadRequestException } from '@nestjs/common';

import {
  validateCreateDeckInput,
  validateUpdateDeckPublicationInput,
  validateUpdateDeckInput,
} from './deck-validation';

describe('deck-validation', () => {
  it('accepts valid create input with kids presentation mode', () => {
    expect(() =>
      validateCreateDeckInput({
        name: 'Kids deck',
        presentationMode: 'kids',
        reviewIntervalHours: [24, 48],
        exerciseSettings: {
          whatDidYouHear: {
            choiceCount: 3,
          },
        },
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
        exerciseSettings: {
          whatDidYouHear: {
            choiceCount: 2,
          },
        },
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

  it('rejects invalid exercise settings choice counts', () => {
    expect(() =>
      validateCreateDeckInput({
        name: 'Kids deck',
        exerciseSettings: {
          whatDidYouHear: {
            choiceCount: 5,
          },
        },
      }),
    ).toThrow(BadRequestException);
  });

  it('accepts valid deck publication input', () => {
    expect(() =>
      validateUpdateDeckPublicationInput({
        isPublic: true,
      }),
    ).not.toThrow();
  });

  it('rejects invalid deck publication input', () => {
    expect(() =>
      validateUpdateDeckPublicationInput({
        isPublic: 'yes',
      } as never),
    ).toThrow(BadRequestException);
  });
});

import {
  getCardKindFields,
  getCardKindOptions,
  parseCardKindFields,
  resolveSupportedCardKind,
  serializeCardKindFields,
} from './registry';

describe('card-kinds registry', () => {
  it('resolves unsupported kinds to the default kind', () => {
    expect(resolveSupportedCardKind(undefined)).toBe('basic');
    expect(resolveSupportedCardKind('audio_gap')).toBe('basic');
    expect(resolveSupportedCardKind('cloze_text')).toBe('cloze_text');
  });

  it('returns options for both supported kinds', () => {
    expect(getCardKindOptions()).toEqual([
      { value: 'basic', label: 'Basic' },
      { value: 'cloze_text', label: 'Cloze Text' },
    ]);
  });

  it('builds basic fields and serializes/parses correctly', () => {
    const basicFields = getCardKindFields('basic');
    expect(basicFields.map((field) => field.name)).toEqual(['front', 'back']);

    expect(
      serializeCardKindFields('basic', {
        kind: 'basic',
        front: '  spielen ',
        back: ' to play ',
      }),
    ).toEqual({
      front: 'spielen',
      back: 'to play',
    });

    expect(
      parseCardKindFields('basic', {
        front: '  lernen ',
        back: ' to learn ',
      }),
    ).toEqual({
      front: 'lernen',
      back: 'to learn',
    });
  });

  it('builds cloze fields and serializes/parses correctly', () => {
    const clozeFields = getCardKindFields('cloze_text');
    expect(clozeFields.map((field) => field.name)).toEqual([
      'text',
      'answer',
      'hint',
    ]);

    expect(
      serializeCardKindFields('cloze_text', {
        kind: 'cloze_text',
        text: '  Ich {{c1::spiele}} gern Tennis. ',
        answer: ' spiele ',
        hint: ' Verb ',
      }),
    ).toEqual({
      text: 'Ich {{c1::spiele}} gern Tennis.',
      answer: 'spiele',
      hint: 'Verb',
    });

    expect(
      parseCardKindFields('cloze_text', {
        text: '  Wir {{c1::lernen}} Deutsch. ',
        answer: ' lernen ',
        hint: ' Verb ',
      }),
    ).toEqual({
      text: 'Wir {{c1::lernen}} Deutsch.',
      answer: 'lernen',
      hint: 'Verb',
    });
  });
});


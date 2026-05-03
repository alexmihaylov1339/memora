import { getCardSearchPreview } from './card-search-preview';

describe('getCardSearchPreview', () => {
  it('builds previews for basic cards', () => {
    expect(
      getCardSearchPreview({
        id: 'card-1',
        kind: 'basic',
        fields: {
          front: '  Kaffee ',
          back: ' coffee ',
        },
      }),
    ).toEqual({
      label: 'Kaffee',
      description: 'coffee',
      searchableText: 'basic Kaffee coffee',
    });
  });

  it('builds cloze prompts and searchable text from cloze fields', () => {
    expect(
      getCardSearchPreview({
        id: 'card-2',
        kind: 'cloze_text',
        fields: {
          text: 'Ich {{c1::spiele}} gern Tennis.',
          answer: 'spiele',
          hint: 'Verb',
        },
      }),
    ).toEqual({
      label: 'Ich _____ gern Tennis.',
      description: 'spiele',
      searchableText: 'cloze_text Ich {{c1::spiele}} gern Tennis. spiele Verb',
    });
  });
});

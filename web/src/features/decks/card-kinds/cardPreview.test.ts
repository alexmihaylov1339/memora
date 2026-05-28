import { getCardPreview } from './cardPreview';
import type { CardRecord } from '../types';

function buildCard(card: Partial<CardRecord>): CardRecord {
  return {
    id: 'card-1',
    deckId: null,
    kind: 'basic',
    fields: {},
    createdAt: '2026-05-03T00:00:00.000Z',
    ...card,
  };
}

describe('getCardPreview', () => {
  it('builds previews for basic cards', () => {
    expect(
      getCardPreview(
        buildCard({
          fields: {
            front: '  Kaffee ',
            back: ' coffee ',
          },
        }),
      ),
    ).toEqual({
      front: 'Kaffee',
      back: 'coffee',
    });
  });

  it('builds cloze prompts from cloze cards', () => {
    expect(
      getCardPreview(
        buildCard({
          id: 'card-2',
          kind: 'cloze_text',
          fields: {
            text: 'Ich {{c1::spiele}} gern Tennis.',
            answer: 'spiele',
          },
        }),
      ),
    ).toEqual({
      front: 'Ich _____ gern Tennis.',
      back: 'spiele',
    });
  });

  it('builds previews for image_audio cards', () => {
    expect(
      getCardPreview(
        buildCard({
          id: 'card-4',
          kind: 'image_audio',
          fields: {
            label: '  Car ',
            altText: ' Red toy car ',
          },
        }),
      ),
    ).toEqual({
      front: 'Car',
      back: 'Red toy car',
    });
  });

  it('falls back when fields are not readable', () => {
    expect(
      getCardPreview(
        buildCard({
          id: 'card-3',
          fields: {},
        }),
      ),
    ).toEqual({
      front: 'Card card-3',
      back: 'Preview is only available for cards with readable text fields.',
    });
  });
});

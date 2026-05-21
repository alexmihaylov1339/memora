import { mapDeckListResponse } from './deckResponseMapper';

describe('mapDeckListResponse', () => {
  it('defaults missing due card counts to zero', () => {
    expect(
      mapDeckListResponse([
        {
          id: 'deck-1',
          name: 'Spanish',
          count: 3,
          presentationMode: 'standard',
        },
      ]),
    ).toEqual([
      {
        id: 'deck-1',
        name: 'Spanish',
        count: 3,
        dueCount: 0,
        presentationMode: 'standard',
      },
    ]);
  });

  it('defaults missing presentation modes to standard', () => {
    expect(
      mapDeckListResponse([
        {
          id: 'deck-2',
          name: 'Kids',
          count: 1,
          dueCount: 0,
        },
      ]),
    ).toEqual([
      {
        id: 'deck-2',
        name: 'Kids',
        count: 1,
        dueCount: 0,
        presentationMode: 'standard',
      },
    ]);
  });
});

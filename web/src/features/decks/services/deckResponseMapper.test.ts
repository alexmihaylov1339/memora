import { mapDeckListResponse } from './deckResponseMapper';

describe('mapDeckListResponse', () => {
  it('defaults missing due card counts to zero', () => {
    expect(
      mapDeckListResponse([
        {
          id: 'deck-1',
          name: 'Spanish',
          count: 3,
        },
      ]),
    ).toEqual([
      {
        id: 'deck-1',
        name: 'Spanish',
        count: 3,
        dueCount: 0,
      },
    ]);
  });
});

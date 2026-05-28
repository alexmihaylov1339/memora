import {
  mapDeckDetailResponse,
  mapDeckListResponse,
  resolveDeckExerciseSettings,
} from './deckResponseMapper';

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
        isPublic: false,
        exerciseSettings: {
          whatDidYouHear: {
            choiceCount: 4,
          },
        },
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
        isPublic: false,
        exerciseSettings: {
          whatDidYouHear: {
            choiceCount: 4,
          },
        },
      },
    ]);
  });

  it('defaults invalid exercise settings to the quiz default', () => {
    expect(
      resolveDeckExerciseSettings({
        whatDidYouHear: {
          choiceCount: 7,
        },
      }),
    ).toEqual({
      whatDidYouHear: {
        choiceCount: 4,
      },
    });
  });

  it('maps detail responses with normalized exercise settings', () => {
    expect(
      mapDeckDetailResponse({
        id: 'deck-3',
        name: 'Animals',
        count: 4,
        presentationMode: 'kids',
        isPublic: false,
        reviewIntervalHours: [24, 48],
        exerciseSettings: {
          whatDidYouHear: {
            choiceCount: 3,
          },
        },
        sharedUsers: [],
        createdAt: '2026-05-28T10:00:00.000Z',
        updatedAt: '2026-05-28T10:00:00.000Z',
      }),
    ).toEqual({
      id: 'deck-3',
      name: 'Animals',
      count: 4,
      presentationMode: 'kids',
      isPublic: false,
      reviewIntervalHours: [24, 48],
      exerciseSettings: {
        whatDidYouHear: {
          choiceCount: 3,
        },
      },
      sharedUsers: [],
      createdAt: '2026-05-28T10:00:00.000Z',
      updatedAt: '2026-05-28T10:00:00.000Z',
    });
  });
});

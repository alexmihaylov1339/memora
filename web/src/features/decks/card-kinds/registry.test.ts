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
    expect(resolveSupportedCardKind('image_audio')).toBe('image_audio');
  });

  it('returns options for all supported kinds', () => {
    expect(getCardKindOptions()).toEqual([
      { value: 'basic', label: 'Basic' },
      { value: 'cloze_text', label: 'Cloze Text' },
      { value: 'image_audio', label: 'Image + Audio' },
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

  it('builds image_audio fields and serializes/parses correctly', () => {
    const imageAudioFields = getCardKindFields('image_audio');
    expect(imageAudioFields.map((field) => field.name)).toEqual([
      'label',
      'altText',
      'topic',
      'quizTagsInput',
    ]);

    expect(
      serializeCardKindFields('image_audio', {
        kind: 'image_audio',
        label: '  Car ',
        altText: ' Red toy car ',
        topic: ' Vehicles ',
        quizTagsInput: ' transport, road, road ',
        imageAsset: {
          path: 'kids-images/user-1/asset-1/car.jpg',
          mimeType: 'image/jpeg',
          size: 2048,
          url: 'https://example.com/image',
        },
        audioAsset: {
          path: 'kids-audio/user-1/asset-2/car.mp3',
          mimeType: 'audio/mpeg',
          size: 4096,
          url: 'https://example.com/audio',
        },
      }),
    ).toEqual({
      label: 'Car',
      altText: 'Red toy car',
      topic: 'Vehicles',
      quizTags: ['transport', 'road'],
      imageAsset: {
        path: 'kids-images/user-1/asset-1/car.jpg',
        mimeType: 'image/jpeg',
        size: 2048,
        url: 'https://example.com/image',
      },
      audioAsset: {
        path: 'kids-audio/user-1/asset-2/car.mp3',
        mimeType: 'audio/mpeg',
        size: 4096,
        url: 'https://example.com/audio',
      },
    });

    expect(
      parseCardKindFields('image_audio', {
        label: '  Car ',
        altText: ' Red toy car ',
        topic: ' Vehicles ',
        quizTags: ['transport', 'road'],
        imageAsset: {
          path: 'kids-images/user-1/asset-1/car.jpg',
          mimeType: 'image/jpeg',
          size: 2048,
          url: 'https://example.com/image',
        },
        audioAsset: {
          path: 'kids-audio/user-1/asset-2/car.mp3',
          mimeType: 'audio/mpeg',
          size: 4096,
          url: 'https://example.com/audio',
        },
      }),
    ).toEqual({
      label: 'Car',
      altText: 'Red toy car',
      topic: 'Vehicles',
      quizTagsInput: 'transport, road',
      imageAsset: {
        path: 'kids-images/user-1/asset-1/car.jpg',
        mimeType: 'image/jpeg',
        size: 2048,
        url: 'https://example.com/image',
      },
      audioAsset: {
        path: 'kids-audio/user-1/asset-2/car.mp3',
        mimeType: 'audio/mpeg',
        size: 4096,
        url: 'https://example.com/audio',
      },
    });
  });
});

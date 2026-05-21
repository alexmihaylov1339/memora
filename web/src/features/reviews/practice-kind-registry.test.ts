import { resolvePracticeRenderer } from './practice-kind-registry';
import {
  REVIEW_UNSUPPORTED_REASONS,
  type ReviewRenderableItem,
} from './types';

function buildItem(
  overrides: Partial<ReviewRenderableItem> = {},
): ReviewRenderableItem {
  return {
    cardId: 'card-1',
    deckId: 'deck-1',
    chunkId: 'chunk-1',
    chunkTitle: 'Animals',
    chunkPosition: 0,
    positionInChunk: 0,
    kind: 'basic',
    fields: { front: 'cat', back: 'gato' },
    isReviewSupported: true,
    reviewUnsupportedReason: null,
    ...overrides,
  };
}

describe('practice-kind-registry', () => {
  it('keeps standard basic practice cards on the existing renderer path', () => {
    expect(resolvePracticeRenderer(buildItem())).toEqual({
      renderer: 'basic',
      basicCardFields: {
        front: 'cat',
        back: 'gato',
      },
    });
  });

  it('resolves image_audio cards for kids practice even when review is disabled', () => {
    expect(
      resolvePracticeRenderer(
        buildItem({
          kind: 'image_audio',
          isReviewSupported: false,
          reviewUnsupportedReason:
            REVIEW_UNSUPPORTED_REASONS.kindNotReviewEnabled,
          fields: {
            label: 'Car',
            imageAsset: {
              path: 'kids-images/user-1/card-1/car.jpg',
              mimeType: 'image/jpeg',
              size: 128,
              url: 'https://cdn.example.com/car.jpg',
            },
            audioAsset: {
              path: 'kids-audio/user-1/card-1/car.mp3',
              mimeType: 'audio/mpeg',
              size: 256,
              url: 'https://cdn.example.com/car.mp3',
            },
            altText: 'Red toy car',
          },
        }),
      ),
    ).toEqual({
      renderer: 'image_audio',
      imageAudioCardFields: {
        label: 'Car',
        imageAsset: {
          path: 'kids-images/user-1/card-1/car.jpg',
          mimeType: 'image/jpeg',
          size: 128,
          url: 'https://cdn.example.com/car.jpg',
        },
        audioAsset: {
          path: 'kids-audio/user-1/card-1/car.mp3',
          mimeType: 'audio/mpeg',
          size: 256,
          url: 'https://cdn.example.com/car.mp3',
        },
        altText: 'Red toy car',
      },
    });
  });

  it('returns unsupported for invalid image_audio payloads', () => {
    expect(
      resolvePracticeRenderer(
        buildItem({
          kind: 'image_audio',
          isReviewSupported: false,
          reviewUnsupportedReason:
            REVIEW_UNSUPPORTED_REASONS.kindNotReviewEnabled,
          fields: {
            label: 'Car',
            imageAsset: {
              path: 'kids-images/user-1/card-1/car.jpg',
            },
          },
        }),
      ),
    ).toEqual({
      renderer: 'unsupported',
      reason: REVIEW_UNSUPPORTED_REASONS.invalidPayload,
    });
  });
});

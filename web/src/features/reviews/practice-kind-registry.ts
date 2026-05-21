import { parseImageAudioPracticeFields } from './review-kind-fields';
import {
  resolveReviewRenderer,
  type SupportedReviewRenderer,
  type UnsupportedReviewRenderer,
} from './review-kind-registry';
import { REVIEW_UNSUPPORTED_REASONS, type ReviewRenderableItem } from './types';

export type SupportedPracticeRenderer =
  | SupportedReviewRenderer
  | {
      renderer: 'image_audio';
      imageAudioCardFields: NonNullable<ReturnType<typeof parseImageAudioPracticeFields>>;
    };

export type PracticeRendererResolution =
  | SupportedPracticeRenderer
  | UnsupportedReviewRenderer;

export function resolvePracticeRenderer(
  item: ReviewRenderableItem | null,
): PracticeRendererResolution | null {
  if (!item) {
    return null;
  }

  if (item.kind !== 'image_audio') {
    return resolveReviewRenderer(item);
  }

  const imageAudioCardFields = parseImageAudioPracticeFields(item);
  if (!imageAudioCardFields) {
    return {
      renderer: 'unsupported',
      reason: REVIEW_UNSUPPORTED_REASONS.invalidPayload,
    };
  }

  return {
    renderer: 'image_audio',
    imageAudioCardFields,
  };
}

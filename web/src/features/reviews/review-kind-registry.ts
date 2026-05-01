import {
  parseBasicReviewFields,
  parseClozeTextReviewFields,
  type BasicReviewCardFields,
  type ClozeTextReviewCardFields,
} from './review-kind-fields';
import {
  REVIEW_UNSUPPORTED_REASONS,
  type ReviewQueueItem,
  type ReviewUnsupportedReason,
} from './types';

type BasicReviewRenderer = {
  renderer: 'basic';
  basicCardFields: BasicReviewCardFields;
};

type ClozeTextReviewRenderer = {
  renderer: 'cloze_text';
  clozeTextCardFields: ClozeTextReviewCardFields;
};

type UnsupportedReviewRenderer = {
  renderer: 'unsupported';
  reason: ReviewUnsupportedReason;
};

export type SupportedReviewRenderer =
  | BasicReviewRenderer
  | ClozeTextReviewRenderer;

export type ReviewRendererResolution =
  | SupportedReviewRenderer
  | UnsupportedReviewRenderer;

export function resolveReviewRenderer(
  item: ReviewQueueItem | null,
): ReviewRendererResolution | null {
  if (!item) {
    return null;
  }

  if (item.isReviewSupported === false) {
    return {
      renderer: 'unsupported',
      reason:
        item.reviewUnsupportedReason ??
        REVIEW_UNSUPPORTED_REASONS.kindNotReviewEnabled,
    };
  }

  if (item.kind === 'basic') {
    const basicCardFields = parseBasicReviewFields(item);
    if (!basicCardFields) {
      return {
        renderer: 'unsupported',
        reason: REVIEW_UNSUPPORTED_REASONS.invalidPayload,
      };
    }

    return {
      renderer: 'basic',
      basicCardFields,
    };
  }

  if (item.kind === 'cloze_text') {
    const clozeTextCardFields = parseClozeTextReviewFields(item);
    if (!clozeTextCardFields) {
      return {
        renderer: 'unsupported',
        reason: REVIEW_UNSUPPORTED_REASONS.invalidPayload,
      };
    }

    return {
      renderer: 'cloze_text',
      clozeTextCardFields,
    };
  }

  return {
    renderer: 'unsupported',
    reason:
      item.reviewUnsupportedReason ??
      REVIEW_UNSUPPORTED_REASONS.kindNotReviewEnabled,
  };
}

import type { Prisma } from '@prisma/client';
import { isObjectRecord, isString } from '../common/utils/type-guards';

export const REVIEW_KIND_UNSUPPORTED_REASONS = {
  kindNotReviewEnabled: 'kind_not_review_enabled',
  invalidPayload: 'invalid_payload',
} as const;

export type ReviewUnsupportedReason =
  (typeof REVIEW_KIND_UNSUPPORTED_REASONS)[keyof typeof REVIEW_KIND_UNSUPPORTED_REASONS];

export type ReviewKindSupport = {
  isReviewSupported: boolean;
  reviewUnsupportedReason: ReviewUnsupportedReason | null;
};

function hasValidBasicFields(fields: Prisma.JsonValue): boolean {
  if (!isObjectRecord(fields)) {
    return false;
  }

  const front = fields.front;
  const back = fields.back;

  if (!isString(front) || !isString(back)) {
    return false;
  }

  return front.trim().length > 0 && back.trim().length > 0;
}

function extractSingleClozeMarkerValue(text: string): string | null {
  const matches = [...text.matchAll(/{{c1::(.*?)}}/g)];
  if (matches.length !== 1) {
    return null;
  }

  const markerValue = matches[0]?.[1]?.trim() ?? '';
  return markerValue || null;
}

function hasValidClozeTextFields(fields: Prisma.JsonValue): boolean {
  if (!isObjectRecord(fields)) {
    return false;
  }

  const text = fields.text;
  const answer = fields.answer;
  const hint = fields.hint;

  if (!isString(text) || !isString(answer)) {
    return false;
  }

  const normalizedText = text.trim();
  const normalizedAnswer = answer.trim();
  if (!normalizedText || !normalizedAnswer) {
    return false;
  }

  if (hint !== undefined && (!isString(hint) || hint.trim().length === 0)) {
    return false;
  }

  const markerValue = extractSingleClozeMarkerValue(normalizedText);
  return markerValue?.toLowerCase() === normalizedAnswer.toLowerCase();
}

export function resolveReviewKindSupport(
  kind: string,
  fields: Prisma.JsonValue,
): ReviewKindSupport {
  if (kind === 'basic') {
    if (!hasValidBasicFields(fields)) {
      return {
        isReviewSupported: false,
        reviewUnsupportedReason: REVIEW_KIND_UNSUPPORTED_REASONS.invalidPayload,
      };
    }

    return {
      isReviewSupported: true,
      reviewUnsupportedReason: null,
    };
  }

  if (kind === 'cloze_text') {
    if (!hasValidClozeTextFields(fields)) {
      return {
        isReviewSupported: false,
        reviewUnsupportedReason: REVIEW_KIND_UNSUPPORTED_REASONS.invalidPayload,
      };
    }

    return {
      isReviewSupported: true,
      reviewUnsupportedReason: null,
    };
  }

  return {
    isReviewSupported: false,
    reviewUnsupportedReason:
      REVIEW_KIND_UNSUPPORTED_REASONS.kindNotReviewEnabled,
  };
}

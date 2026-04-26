import type { Prisma } from '@prisma/client';

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

function isObjectRecord(value: Prisma.JsonValue): value is Prisma.JsonObject {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function hasValidBasicFields(fields: Prisma.JsonValue): boolean {
  if (!isObjectRecord(fields)) {
    return false;
  }

  const front = fields.front;
  const back = fields.back;

  if (typeof front !== 'string' || typeof back !== 'string') {
    return false;
  }

  return front.trim().length > 0 && back.trim().length > 0;
}

export function resolveReviewKindSupport(
  kind: string,
  fields: Prisma.JsonValue,
): ReviewKindSupport {
  if (kind !== 'basic') {
    return {
      isReviewSupported: false,
      reviewUnsupportedReason:
        REVIEW_KIND_UNSUPPORTED_REASONS.kindNotReviewEnabled,
    };
  }

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

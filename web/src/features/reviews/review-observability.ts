import {
  REVIEW_UNSUPPORTED_REASONS,
  type ReviewUnsupportedReason,
} from './types';

export const REVIEW_UI_EVENTS = {
  unsupportedSeen: 'review_unsupported_seen',
  gradeClicked: 'review_grade_clicked',
  queueStateChanged: 'review_queue_state_changed',
} as const;

export const REVIEW_QUEUE_STATES = {
  empty: 'empty',
  complete: 'complete',
} as const;

export type ReviewQueueState =
  (typeof REVIEW_QUEUE_STATES)[keyof typeof REVIEW_QUEUE_STATES];

export function resolveUnsupportedReason(
  reason?: ReviewUnsupportedReason | null,
): ReviewUnsupportedReason {
  return reason ?? REVIEW_UNSUPPORTED_REASONS.kindNotReviewEnabled;
}

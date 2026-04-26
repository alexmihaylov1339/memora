import { isBrowserEnvironment } from '@shared/utils';

export type AnalyticsPayload = Record<string, unknown>;

export function trackAnalyticsEvent(
  event: string,
  payload: AnalyticsPayload = {},
): void {
  if (isBrowserEnvironment()) {
    window.dispatchEvent(
      new CustomEvent('memora:analytics', {
        detail: { event, payload },
      }),
    );
  }

  if (process.env.NODE_ENV !== 'test') {
    // Useful during rollout debugging until a sink provider is attached.
    // Keep payload metadata-only (no user content fields).
    console.info(`[analytics] ${event}`, payload);
  }
}

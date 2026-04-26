import type { Logger } from '@nestjs/common';

export type StructuredEventLogger = Pick<Logger, 'log'>;

export function logStructuredEvent(
  logger: StructuredEventLogger,
  event: string,
  payload: Record<string, unknown>,
): void {
  logger.log(
    JSON.stringify({
      event,
      ...payload,
    }),
  );
}

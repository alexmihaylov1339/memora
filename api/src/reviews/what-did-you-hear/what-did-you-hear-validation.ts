import { BadRequestException } from '@nestjs/common';
import { isNumber } from '../../common/utils/type-guards';
import { REVIEW_ERROR_MESSAGES } from '../review-errors';

export interface SubmitWhatDidYouHearResultDto {
  wrongAttemptCount: number;
}

export function validateWhatDidYouHearSubmitInput(
  body: SubmitWhatDidYouHearResultDto,
): number {
  if (!body) {
    throw new BadRequestException(REVIEW_ERROR_MESSAGES.bodyRequired);
  }

  if (
    !isNumber(body.wrongAttemptCount) ||
    !Number.isInteger(body.wrongAttemptCount) ||
    body.wrongAttemptCount < 0
  ) {
    throw new BadRequestException(
      REVIEW_ERROR_MESSAGES.invalidWrongAttemptCount,
    );
  }

  return body.wrongAttemptCount;
}

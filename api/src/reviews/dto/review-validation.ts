import { BadRequestException } from '@nestjs/common';
import { Grade } from '@prisma/client';
import { hasTrimmedText, isString } from '../../common/utils';
import { REVIEW_ERROR_MESSAGES } from '../review-errors';
import type { GradeReviewDto } from './grade-review.dto';

const REVIEW_GRADES = Object.values(Grade) as readonly Grade[];

function isReviewGrade(value: unknown): value is Grade {
  return isString(value) && REVIEW_GRADES.includes(value as Grade);
}

export function validateReviewCardId(cardId: string): string {
  if (!hasTrimmedText(cardId)) {
    throw new BadRequestException(REVIEW_ERROR_MESSAGES.cardIdRequired);
  }

  return cardId.trim();
}

export function validateGradeReviewInput(body: GradeReviewDto): Grade {
  if (!body) {
    throw new BadRequestException(REVIEW_ERROR_MESSAGES.bodyRequired);
  }

  if (!isReviewGrade(body.grade)) {
    throw new BadRequestException(REVIEW_ERROR_MESSAGES.invalidGrade);
  }

  return body.grade;
}

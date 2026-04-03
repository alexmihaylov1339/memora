import { BadRequestException } from '@nestjs/common';
import { Grade } from '@prisma/client';
import { hasTrimmedText, isString } from '../../common/utils';
import type { GradeReviewDto } from './grade-review.dto';

const REVIEW_GRADES = Object.values(Grade) as readonly Grade[];

function isReviewGrade(value: unknown): value is Grade {
  return isString(value) && REVIEW_GRADES.includes(value as Grade);
}

export function validateReviewCardId(cardId: string): string {
  if (!hasTrimmedText(cardId)) {
    throw new BadRequestException('cardId is required');
  }

  return cardId.trim();
}

export function validateGradeReviewInput(body: GradeReviewDto): Grade {
  if (!body) {
    throw new BadRequestException('body is required');
  }

  if (!isReviewGrade(body.grade)) {
    throw new BadRequestException(
      `grade must be one of: ${REVIEW_GRADES.join(', ')}`,
    );
  }

  return body.grade;
}

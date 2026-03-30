import { BadRequestException } from '@nestjs/common';
import { hasTrimmedText, isNumber } from '../../common/utils';
import type { GradeReviewDto } from './grade-review.dto';

export function validateReviewCardId(cardId: string): string {
  if (!hasTrimmedText(cardId)) {
    throw new BadRequestException('cardId is required');
  }

  return cardId.trim();
}

export function validateGradeReviewInput(body: GradeReviewDto) {
  if (!body) {
    throw new BadRequestException('body is required');
  }

  if (!isNumber(body.grade)) {
    throw new BadRequestException('grade must be a number');
  }
}

import { Injectable } from '@nestjs/common';
import type { GradeReviewDto } from './dto/grade-review.dto';

@Injectable()
export class ReviewsService {
  getQueueStub() {
    return {
      module: 'reviews' as const,
      status: 'not_implemented' as const,
      operation: 'queue' as const,
      message: 'Review queue logic will be implemented in Step 4 and Step 5.',
      payload: {
        items: [],
      },
    };
  }

  gradeStub(cardId: string, input: GradeReviewDto) {
    return {
      module: 'reviews' as const,
      status: 'not_implemented' as const,
      operation: 'grade' as const,
      message: 'Review grading logic will be implemented in Step 4 and Step 5.',
      payload: {
        cardId,
        grade: input.grade,
      },
    };
  }
}

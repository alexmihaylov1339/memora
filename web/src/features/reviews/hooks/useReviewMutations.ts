import { useService, type UseServiceOptions } from '@shared/hooks';
import { reviewService } from '../services';
import type {
  GradeReviewDto,
  GradeReviewResponse,
  ReviewCardIdParams,
} from '../types';

export function useGradeReviewMutation(
  options?: UseServiceOptions<GradeReviewResponse>,
) {
  return useService<ReviewCardIdParams & GradeReviewDto, GradeReviewResponse>(
    reviewService.grade,
    options,
  );
}

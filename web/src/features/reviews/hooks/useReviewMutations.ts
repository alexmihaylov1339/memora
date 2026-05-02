import { useMutation } from '@tanstack/react-query';

import { reviewService } from '../services';
import type {
  GradeReviewDto,
  GradeReviewResponse,
  ReviewCardIdParams,
} from '../types';

type GradeReviewMutationInput = ReviewCardIdParams & GradeReviewDto;

interface GradeReviewMutationCallbacks {
  onError?: (error: Error) => void;
  onSuccess?: (data: GradeReviewResponse) => void;
}

export function useGradeReviewMutation() {
  const mutation = useMutation<
    GradeReviewResponse,
    Error,
    GradeReviewMutationInput
  >({
    mutationFn: reviewService.grade,
  });

  return {
    error: mutation.error,
    grade: (
      input: GradeReviewMutationInput,
      callbacks?: GradeReviewMutationCallbacks,
    ) => {
      mutation.mutate(input, callbacks);
    },
    isLoading: mutation.isPending,
    reset: mutation.reset,
  };
}

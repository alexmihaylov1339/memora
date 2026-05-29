import { useMutation } from '@tanstack/react-query';

import { reviewService } from '../services';
import type {
  GradeReviewDto,
  GradeReviewResponse,
  ReviewCardIdParams,
  SubmitWhatDidYouHearResponse,
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

interface SubmitWhatDidYouHearInput {
  cardId: string;
  deckId: string;
  wrongAttemptCount: number;
}

interface SubmitWhatDidYouHearCallbacks {
  onError?: (error: Error) => void;
  onSuccess?: (data: SubmitWhatDidYouHearResponse) => void;
}

export function useSubmitWhatDidYouHearResultMutation() {
  const mutation = useMutation<
    SubmitWhatDidYouHearResponse,
    Error,
    SubmitWhatDidYouHearInput
  >({
    mutationFn: reviewService.submitWhatDidYouHearResult,
  });

  return {
    error: mutation.error,
    isLoading: mutation.isPending,
    reset: mutation.reset,
    submit: (
      input: SubmitWhatDidYouHearInput,
      callbacks?: SubmitWhatDidYouHearCallbacks,
    ) => {
      mutation.mutate(input, callbacks);
    },
  };
}

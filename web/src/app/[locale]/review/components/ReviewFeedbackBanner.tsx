import type { GradeReviewResponse } from '@features/reviews';

interface ReviewFeedbackBannerProps {
  result: GradeReviewResponse;
}

export default function ReviewFeedbackBanner({
  result,
}: ReviewFeedbackBannerProps) {
  const statusLabel = getReviewFeedbackLabel(result);

  return (
    <section className="rounded-lg border border-emerald-200 bg-emerald-50 p-4">
      <p className="text-sm font-medium text-emerald-900">{statusLabel}</p>
      <p className="mt-1 text-sm text-emerald-800">
        Next review in {result.intervalHours}h. Streak is now{' '}
        {result.consecutiveSuccessCount}.
      </p>
    </section>
  );
}

function getReviewFeedbackLabel(result: GradeReviewResponse): string {
  if (result.reset) {
    return 'Chunk progress reset after this grade.';
  }

  if (result.advanced) {
    return 'Chunk progress advanced successfully.';
  }

  return 'Grade recorded.';
}

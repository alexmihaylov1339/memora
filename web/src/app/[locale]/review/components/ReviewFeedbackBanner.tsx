import type { GradeReviewResponse } from '@features/reviews';

interface ReviewFeedbackBannerProps {
  result: GradeReviewResponse;
}

export default function ReviewFeedbackBanner({}: ReviewFeedbackBannerProps) {
  return (
    <section className="rounded-lg border border-emerald-200 bg-emerald-50 p-4">
      <p className="text-sm font-medium text-emerald-900">Grade saved.</p>
    </section>
  );
}

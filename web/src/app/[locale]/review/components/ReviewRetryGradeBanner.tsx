import { Button } from '@shared/components';
import type { ReviewGrade } from '@features/reviews';

interface ReviewRetryGradeBannerProps {
  cardId: string;
  errorMessage: string;
  grade: ReviewGrade;
  isRetrying: boolean;
  onRetry: () => Promise<void> | void;
}

export default function ReviewRetryGradeBanner({
  cardId,
  errorMessage,
  grade,
  isRetrying,
  onRetry,
}: ReviewRetryGradeBannerProps) {
  return (
    <section className="rounded-lg border border-destructive-line bg-destructive-soft p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-destructive-text">
            Previous grade did not save.
          </p>
          <p className="mt-1 text-sm text-slate-700">
            Retry {grade} for card {cardId}. {errorMessage}
          </p>
        </div>
        <Button
          type="button"
          disabled={isRetrying}
          isLoading={isRetrying}
          onClick={onRetry}
          className="rounded-md border border-destructive-line bg-white px-4 py-2 text-sm font-medium text-destructive-text hover:bg-destructive-soft disabled:cursor-not-allowed disabled:opacity-60"
        >
          Retry
        </Button>
      </div>
    </section>
  );
}

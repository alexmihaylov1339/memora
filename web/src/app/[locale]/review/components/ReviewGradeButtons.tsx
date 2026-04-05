import { Button, ErrorMessage } from '@shared/components';
import type { ReviewGrade } from '@features/reviews';

const REVIEW_GRADE_OPTIONS = ['again', 'hard', 'good', 'easy'] as const;

interface ReviewGradeButtonsProps {
  disabled: boolean;
  errorMessage?: string;
  isLoading: boolean;
  onGrade: (grade: ReviewGrade) => Promise<void> | void;
}

export default function ReviewGradeButtons({
  disabled,
  errorMessage,
  isLoading,
  onGrade,
}: ReviewGradeButtonsProps) {
  return (
    <section className="rounded-lg border border-[var(--border)] bg-white p-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold text-slate-900">Grades</h3>
          <p className="mt-1 text-sm text-slate-600">
            Reveal the answer, then grade the current card to continue the review flow.
          </p>
        </div>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-4">
        {REVIEW_GRADE_OPTIONS.map((grade) => (
          <Button
            key={grade}
            type="button"
            disabled={disabled}
            isLoading={isLoading}
            onClick={() => onGrade(grade)}
            className="rounded-md border border-slate-300 px-3 py-2 text-sm capitalize text-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {grade}
          </Button>
        ))}
      </div>

      {errorMessage && <ErrorMessage className="mt-4" message={errorMessage} />}
    </section>
  );
}
